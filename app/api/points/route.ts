import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";

type PointSummary = Database["public"]["Views"]["point_summaries"]["Row"];

type ResponseData = {
  data?: PointSummary;
  error?: string;
  message?: string;
};

// GET /api/points
export async function GET() {
  try {
    // NOTE: The point_summaries view should be updated in the database to include
    // WHERE is_active = true in its definition to only count active events

    // First try to get points from the view (assuming it's been updated)
    const { data: viewData, error: viewError } = await supabase
      .from("point_summaries")
      .select("*")
      .single();

    if (!viewError && viewData) {
      return NextResponse.json(viewData);
    }

    // If the view doesn't exist or hasn't been updated, calculate points manually
    console.log("Calculating points manually (view may need update)");

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of the current week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all active events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("points, timestamp")
      .eq("is_active", true);

    if (eventsError) throw eventsError;

    let totalPoints = 0;
    let weeklyPoints = 0;
    let monthlyPoints = 0;

    events?.forEach((event) => {
      const eventDate = new Date(event.timestamp);
      totalPoints += event.points;

      if (eventDate >= weekStart) {
        weeklyPoints += event.points;
      }

      if (eventDate >= monthStart) {
        monthlyPoints += event.points;
      }
    });

    const pointSummary = {
      total_points: totalPoints,
      weekly_points: weeklyPoints,
      monthly_points: monthlyPoints,
    };

    return NextResponse.json(pointSummary);
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
