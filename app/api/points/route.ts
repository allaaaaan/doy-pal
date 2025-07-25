import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";

type PointSummary = Database["public"]["Views"]["point_summaries"]["Row"];

type ResponseData = {
  data?: PointSummary;
  error?: string;
  message?: string;
};

// GET /api/points?profile_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profile_id');

    if (!profileId) {
      return NextResponse.json({ error: 'profile_id is required' }, { status: 400 });
    }

    // Try to get points from the profile-specific view
    const { data: viewData, error: viewError } = await supabase
      .from("point_summaries")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (!viewError && viewData) {
      return NextResponse.json(viewData);
    }

    // If the view doesn't work, calculate points manually for the specific profile
    console.log("Calculating points manually for profile:", profileId);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of the current week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all active events for this profile
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("points, timestamp")
      .eq("is_active", true)
      .eq("profile_id", profileId);

    if (eventsError) throw eventsError;

    let totalPoints = 0;
    let weeklyPoints = 0;
    let monthlyPoints = 0;

    events?.forEach((event) => {
      const eventTime = new Date(event.timestamp);
      totalPoints += event.points;

      if (eventTime >= weekStart) {
        weeklyPoints += event.points;
      }

      if (eventTime >= monthStart) {
        monthlyPoints += event.points;
      }
    });

    const summary: PointSummary = {
      profile_id: profileId,
      total_points: totalPoints,
      weekly_points: weeklyPoints,
      monthly_points: monthlyPoints,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
