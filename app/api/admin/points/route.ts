import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Database } from "../../types/database.types";

type EventWithPoints = {
  day_of_week: string | null;
  points: number;
};

export async function GET() {
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

    // Fetch point summaries view
    const { data: pointSummaries, error: summaryError } = await supabase
      .from("point_summaries")
      .select("*");

    if (summaryError) throw summaryError;

    // Fetch total points by day
    const { data: pointsByDay, error: dayError } = await supabase
      .from("events")
      .select("day_of_week, points")
      .eq("is_active", true);

    if (dayError) throw dayError;

    // Process points by day
    const dayTotals: Record<string, number> = {};
    (pointsByDay as EventWithPoints[]).forEach((event) => {
      if (!event.day_of_week) return;

      dayTotals[event.day_of_week] =
        (dayTotals[event.day_of_week] || 0) + event.points;
    });

    return NextResponse.json({
      pointSummaries,
      pointsByDay: dayTotals,
    });
  } catch (error) {
    console.error("Error fetching admin points:", error);
    return NextResponse.json(
      {
        message: "Error fetching points data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
