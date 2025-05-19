import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../types/database.types";

interface PathParams {
  id: string;
}

// Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: PathParams }
) {
  try {
    // Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    // Check if environment variables are available
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing");
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const body = await request.json();
    const id = params.id.toString(); // Convert to string to ensure it's not a Promise

    const { data, error } = await supabase
      .from("events")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      {
        message: "Error updating event",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Permanently delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: PathParams }
) {
  try {
    // Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    // Check if environment variables are available
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing");
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const id = params.id.toString(); // Convert to string to ensure it's not a Promise

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Event permanently deleted" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      {
        message: "Error deleting event",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
