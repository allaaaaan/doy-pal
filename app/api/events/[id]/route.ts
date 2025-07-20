import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import { Database } from "../../types/database.types";
import { translateAndGenerateEmbedding } from "../../../utils/embeddings";

type Event = Database["public"]["Tables"]["events"]["Row"];

type ResponseData = {
  data?: Event;
  error?: string;
  message?: string;
};

// GET /api/events/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PATCH /api/events/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // AI FEATURES DISABLED - Skip AI processing for updates
    if (body.description) {
      console.log("AI processing skipped for updated event - features disabled");
    }

    // Auto-generate name if not provided but description exists
    if (!body.name && body.description) {
      body.name =
        body.description.length <= 50
          ? body.description
          : body.description.substring(0, 47) + "...";
    }

    const { data, error } = await supabase
      .from("events")
      .update(body)
      .eq("id", id)
      .eq("is_active", true)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Perform soft delete by setting is_active to false
    const { data, error } = await supabase
      .from("events")
      .update({ is_active: false })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error soft-deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
