import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../types/database.types";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";

export async function POST(request: NextRequest) {
  try {
    // Check for environment variables
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Parse the request body
    const body = await request.json();
    const { eventId, embedding } = body;

    if (!eventId || !embedding) {
      return NextResponse.json(
        { error: "Event ID and embedding are required" },
        { status: 400 }
      );
    }

    // Update the event with the embedding
    const { data, error } = await supabase
      .from("events")
      .update({ description_embedding: embedding })
      .eq("id", eventId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: "Event updated with embedding successfully",
      event: data,
    });
  } catch (error) {
    console.error("Error updating event with embedding:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
