import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UnlinkedEvent {
  id: string;
  name: string;
  description: string;
  normalized_description: string | null;
  points: number;
  timestamp: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  default_points: number;
  ai_confidence: number;
}

interface LinkSuggestion {
  event_id: string;
  template_id: string;
  confidence: number;
  reason: string;
}

// GET - Fetch unlinked events and available templates
export async function GET() {
  try {
    // Fetch events without template_id
    const { data: unlinkedEvents, error: eventsError } = await supabase
      .from("events")
      .select(
        "id, name, description, normalized_description, points, timestamp"
      )
      .is("template_id", null)
      .eq("is_active", true)
      .order("timestamp", { ascending: false })
      .limit(50); // Limit for performance

    if (eventsError) {
      console.error("Error fetching unlinked events:", eventsError);
      return NextResponse.json(
        { error: "Failed to fetch unlinked events" },
        { status: 500 }
      );
    }

    // Fetch available templates
    const { data: templates, error: templatesError } = await supabase
      .from("templates")
      .select("id, name, description, default_points, ai_confidence")
      .eq("is_active", true)
      .order("ai_confidence", { ascending: false });

    if (templatesError) {
      console.error("Error fetching templates:", templatesError);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      unlinked_events: unlinkedEvents || [],
      templates: templates || [],
      summary: {
        unlinked_count: unlinkedEvents?.length || 0,
        templates_count: templates?.length || 0,
      },
    });
  } catch (error) {
    console.error("Link events API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Link specific event to template or generate suggestions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, event_id, template_id, batch_link } = body;

    if (action === "link_single") {
      // Link a single event to a template
      if (!event_id || !template_id) {
        return NextResponse.json(
          { error: "Missing event_id or template_id" },
          { status: 400 }
        );
      }

      const { data: linkedEvent, error } = await supabase
        .from("events")
        .update({
          template_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", event_id)
        .select()
        .single();

      if (error) {
        console.error("Error linking event:", error);
        return NextResponse.json(
          { error: "Failed to link event to template" },
          { status: 500 }
        );
      }

      // Update template usage
      const { data: template } = await supabase
        .from("templates")
        .select("frequency")
        .eq("id", template_id)
        .single();

      await supabase
        .from("templates")
        .update({
          frequency: (template?.frequency || 0) + 1,
          last_seen: new Date().toISOString(),
        })
        .eq("id", template_id);

      return NextResponse.json({
        success: true,
        linked_event: linkedEvent,
        message: "Event linked to template successfully",
      });
    } else if (action === "generate_suggestions") {
      // Generate AI-powered linking suggestions
      const { data: unlinkedEvents, error: eventsError } = await supabase
        .from("events")
        .select(
          "id, name, description, normalized_description, points, timestamp"
        )
        .is("template_id", null)
        .eq("is_active", true)
        .limit(20); // Smaller batch for AI processing

      const { data: templates, error: templatesError } = await supabase
        .from("templates")
        .select("id, name, description, default_points")
        .eq("is_active", true);

      if (eventsError || templatesError || !unlinkedEvents || !templates) {
        return NextResponse.json(
          { error: "Failed to fetch data for suggestions" },
          { status: 500 }
        );
      }

      // Generate AI suggestions
      const suggestions = await generateLinkingSuggestions(
        unlinkedEvents,
        templates as any
      );

      return NextResponse.json({
        success: true,
        suggestions,
        message: `Generated ${suggestions.length} linking suggestions`,
      });
    } else if (action === "batch_link") {
      // Batch link multiple events based on suggestions
      if (!batch_link || !Array.isArray(batch_link)) {
        return NextResponse.json(
          { error: "Invalid batch_link data" },
          { status: 400 }
        );
      }

      const results = [];
      for (const link of batch_link) {
        try {
          const { data, error } = await supabase
            .from("events")
            .update({
              template_id: link.template_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", link.event_id)
            .select()
            .single();

          if (!error) {
            // Update template usage
            const { data: template } = await supabase
              .from("templates")
              .select("frequency")
              .eq("id", link.template_id)
              .single();

            await supabase
              .from("templates")
              .update({
                frequency: (template?.frequency || 0) + 1,
                last_seen: new Date().toISOString(),
              })
              .eq("id", link.template_id);

            results.push({ event_id: link.event_id, success: true });
          } else {
            results.push({
              event_id: link.event_id,
              success: false,
              error: error.message,
            });
          }
        } catch (err) {
          results.push({
            event_id: link.event_id,
            success: false,
            error: "Unknown error",
          });
        }
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      return NextResponse.json({
        success: true,
        results,
        summary: {
          successful,
          failed,
          total: results.length,
        },
        message: `Batch linking completed: ${successful} successful, ${failed} failed`,
      });
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid action. Use: link_single, generate_suggestions, or batch_link",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Link events POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate AI-powered linking suggestions
async function generateLinkingSuggestions(
  events: UnlinkedEvent[],
  templates: Template[]
): Promise<LinkSuggestion[]> {
  try {
    const prompt = `You are helping to link child behavior events to templates. For each event, suggest the best matching template.

Events to match:
${events
  .map(
    (e) =>
      `Event ${e.id}: "${e.normalized_description || e.description}" (${
        e.points
      } points)`
  )
  .join("\n")}

Available Templates:
${templates
  .map(
    (t) =>
      `Template ${t.id}: "${t.name}" - "${t.description}" (${t.default_points} points)`
  )
  .join("\n")}

For each event, return a JSON array with suggestions:
{
  "suggestions": [
    {
      "event_id": "event_id_here",
      "template_id": "best_matching_template_id",
      "confidence": 0.85,
      "reason": "Short explanation why this template matches"
    }
  ]
}

Only suggest matches with confidence > 0.6. If no good match exists, skip that event.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at matching child behavior events to templates based on content similarity and point values.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      console.error("No AI response for suggestions");
      return [];
    }

    const parsed = JSON.parse(aiResponse);
    return parsed.suggestions || [];
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return [];
  }
}
