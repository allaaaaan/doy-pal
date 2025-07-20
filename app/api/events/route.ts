import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";
import { translateAndGenerateEmbedding } from "../../utils/embeddings";

type Event = Database["public"]["Tables"]["events"]["Row"];
type NewEvent = Database["public"]["Tables"]["events"]["Insert"];

type ResponseData = {
  data?: Event | Event[];
  error?: string;
  message?: string;
};

// GET /api/events
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        templates (
          id,
          name,
          ai_confidence
        )
      `
      )
      .eq("is_active", true)
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventData = {
      ...body,
      is_active: true,
    };

    // Auto-generate name if not provided
    if (!eventData.name && eventData.description) {
      eventData.name =
        eventData.description.length <= 50
          ? eventData.description
          : eventData.description.substring(0, 47) + "...";
    }

    // AI FEATURES DISABLED - Skip AI processing
    let aiResult = null;
    console.log("AI processing skipped - features disabled");

    // If template_id is provided, update template usage
    if (eventData.template_id) {
      // Get current template frequency
      const { data: template } = await supabase
        .from("templates")
        .select("frequency")
        .eq("id", eventData.template_id)
        .single();

      // Update template's last_seen timestamp and frequency
      await supabase
        .from("templates")
        .update({
          last_seen: new Date().toISOString(),
          frequency: (template?.frequency || 0) + 1,
        })
        .eq("id", eventData.template_id);
    }

    // Add AI fields if processing was successful
    if (aiResult) {
      eventData.normalized_description = aiResult.translatedText;
      eventData.description_embedding = aiResult.embedding;
    }

    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select(
        `
        *,
        templates (
          id,
          name,
          ai_confidence
        )
      `
      )
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
