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

// GET /api/events?profile_id=xxx&limit=20
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit');
    const profileId = url.searchParams.get('profile_id');
    
    if (!profileId) {
      return NextResponse.json({ error: 'profile_id is required' }, { status: 400 });
    }
    
    let query = supabase
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
      .eq("profile_id", profileId)
      .order("timestamp", { ascending: false });

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    }

    const { data, error } = await query;

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
    
    if (!body.profile_id) {
      return NextResponse.json({ error: 'profile_id is required' }, { status: 400 });
    }
    
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
