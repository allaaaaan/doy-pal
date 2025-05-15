import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../lib/supabase";

// GET /api/points
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("point_summaries")
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
