import { NextResponse } from "next/server";
import { supabase } from "../lib/supabase";

// GET /api/schema
export async function GET() {
  try {
    // Create events table if it doesn't exist
    const { error: tableError } = await supabase
      .from("events")
      .select("*")
      .limit(1)
      .throwOnError();

    if (tableError) {
      // Table doesn't exist, create it
      const { error: createError } = await supabase
        .from("events")
        .insert({
          description: "Initial setup",
          points: 1,
          day_of_week: "Monday",
          day_of_month: 1,
        })
        .select()
        .single();

      if (createError) throw createError;
    }

    // Insert sample data
    const { error: sampleDataError } = await supabase.from("events").upsert(
      [
        {
          description: "Helped set the table",
          points: 2,
          day_of_week: "Monday",
          day_of_month: 1,
        },
        {
          description: "Brushed teeth without reminding",
          points: 1,
          day_of_week: "Monday",
          day_of_month: 1,
        },
      ],
      { onConflict: "id" }
    );

    if (sampleDataError) throw sampleDataError;

    return NextResponse.json({
      message: "Database schema created successfully",
    });
  } catch (error) {
    console.error("Error creating database schema:", error);
    return NextResponse.json(
      { error: "Failed to create database schema" },
      { status: 500 }
    );
  }
}
