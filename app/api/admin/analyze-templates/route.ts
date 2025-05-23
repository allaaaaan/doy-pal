import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EventData {
  id: string;
  description: string;
  normalized_description: string | null;
  points: number;
  timestamp: string;
}

interface TemplateFromAI {
  name: string;
  description: string;
  default_points: number;
  frequency: number;
  ai_confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Fetch latest 100 events with normalized descriptions
    console.log("Fetching latest 100 events for analysis...");
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, description, normalized_description, points, timestamp")
      .eq("is_active", true)
      .order("timestamp", { ascending: false })
      .limit(100);

    if (eventsError || !events) {
      console.error("Error fetching events:", eventsError);
      return NextResponse.json(
        { error: "Failed to fetch events for analysis" },
        { status: 500 }
      );
    }

    if (events.length === 0) {
      return NextResponse.json(
        { error: "No events found for analysis" },
        { status: 400 }
      );
    }

    console.log(`Analyzing ${events.length} events...`);

    // Step 2: Prepare events for AI analysis using normalized_description
    const eventsForAnalysis = events.map((event) => ({
      // Use normalized_description if available, fallback to description
      text: event.normalized_description || event.description,
      points: event.points,
    }));

    // Filter out any events without valid text
    const validEvents = eventsForAnalysis.filter(
      (event) => event.text && event.text.trim().length > 0
    );

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: "No valid events with descriptions found for analysis" },
        { status: 400 }
      );
    }

    // Step 3: Prepare AI prompt
    const prompt = `Analyze these child behavior tracking events and identify common patterns. 
    
For each pattern you identify, provide:
- A clear, concise template name (in English)
- A standardized description that could be reused
- Typical point value (1-10 scale)
- Estimated frequency (how many events match this pattern)
- Your confidence in this pattern (0.0-1.0)

Events to analyze:
${validEvents.map((e) => `"${e.text}" (${e.points} points)`).join("\n")}

Return a JSON object with this exact structure:
{
  "templates": [
    {
      "name": "Template Name",
      "description": "Standardized description",
      "default_points": 5,
      "frequency": 10,
      "ai_confidence": 0.85
    }
  ]
}

Focus on finding 5-15 meaningful patterns. Avoid overly specific templates.`;

    // Step 4: Call OpenAI
    console.log("Sending normalized event data to OpenAI for analysis...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing child behavior patterns and creating reusable templates.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    console.log("AI Response received, parsing...");

    // Step 5: Parse AI response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("AI Response:", aiResponse);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const templates: TemplateFromAI[] = parsedResponse.templates || [];

    if (templates.length === 0) {
      return NextResponse.json(
        { error: "No templates generated from analysis" },
        { status: 400 }
      );
    }

    // Step 6: Create new batch ID
    const batchId = crypto.randomUUID();

    // Step 7: Deactivate existing templates
    console.log("Deactivating existing templates...");
    const { error: deactivateError } = await supabase
      .from("templates")
      .update({ is_active: false })
      .eq("is_active", true);

    if (deactivateError) {
      console.error("Error deactivating existing templates:", deactivateError);
      return NextResponse.json(
        { error: "Failed to deactivate existing templates" },
        { status: 500 }
      );
    }

    // Step 8: Insert new templates
    console.log(`Inserting ${templates.length} new templates...`);
    const templatesWithBatch = templates.map((template) => ({
      ...template,
      generation_batch: batchId,
      is_active: true,
      last_seen: new Date().toISOString(),
    }));

    const { data: insertedTemplates, error: insertError } = await supabase
      .from("templates")
      .insert(templatesWithBatch)
      .select();

    if (insertError) {
      console.error("Error inserting new templates:", insertError);
      return NextResponse.json(
        { error: "Failed to insert new templates" },
        { status: 500 }
      );
    }

    // Step 9: Log analysis metadata
    console.log("Logging analysis metadata...");
    const { error: logError } = await supabase
      .from("template_analysis")
      .insert({
        batch_id: batchId,
        analyzed_events_count: validEvents.length,
        ai_model_used: "gpt-4",
        analysis_prompt: prompt,
        ai_response_raw: parsedResponse,
        templates_generated: templates.length,
      });

    if (logError) {
      console.error("Error logging analysis metadata:", logError);
      // Don't fail the request for logging errors
    }

    console.log("Template analysis completed successfully!");

    return NextResponse.json({
      success: true,
      batch_id: batchId,
      analyzed_events: validEvents.length,
      templates_generated: templates.length,
      templates: insertedTemplates,
      message: `Successfully analyzed ${validEvents.length} events and generated ${templates.length} templates`,
    });
  } catch (error) {
    console.error("Template analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error during template analysis" },
      { status: 500 }
    );
  }
}
