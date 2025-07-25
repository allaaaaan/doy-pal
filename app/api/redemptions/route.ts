import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";

type Redemption = Database["public"]["Tables"]["redemptions"]["Row"];
type NewRedemption = Database["public"]["Tables"]["redemptions"]["Insert"];

// GET /api/redemptions?profile_id=xxx&include_withdrawn=false - Get redemption history for profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profile_id');
    const includeWithdrawn = searchParams.get('include_withdrawn') === 'true';

    if (!profileId) {
      return NextResponse.json({ error: 'profile_id is required' }, { status: 400 });
    }

    let query = supabase
      .from("redemptions")
      .select(`
        *,
        rewards (
          id,
          name,
          point_cost,
          image_url
        )
      `)
      .eq('profile_id', profileId);

    // Filter by status unless explicitly including withdrawn
    if (!includeWithdrawn) {
      query = query.eq('status', 'active');
    }

    const { data: redemptions, error } = await query
      .order("redeemed_at", { ascending: false });

    if (error) {
      console.error("Error fetching redemptions:", error);
      return NextResponse.json(
        { error: "Failed to fetch redemptions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ redemptions });
  } catch (error) {
    console.error("Redemptions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/redemptions - Redeem a reward
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reward_id } = body;

    if (!reward_id) {
      return NextResponse.json(
        { error: "Missing required field: reward_id" },
        { status: 400 }
      );
    }

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from("rewards")
      .select("*")
      .eq("id", reward_id)
      .eq("is_active", true)
      .single();

    if (rewardError || !reward) {
      return NextResponse.json(
        { error: "Reward not found or inactive" },
        { status: 404 }
      );
    }

    // Calculate current points (events - redemptions)
    const { data: pointSummary, error: pointsError } = await supabase
      .from("point_summaries")
      .select("total_points")
      .single();

    if (pointsError) {
      console.error("Error calculating points:", pointsError);
      return NextResponse.json(
        { error: "Failed to calculate current points" },
        { status: 500 }
      );
    }

    const currentPoints = pointSummary?.total_points || 0;

    // Check if user has enough points
    if (currentPoints < reward.point_cost) {
      return NextResponse.json(
        { 
          error: "Insufficient points",
          required: reward.point_cost,
          current: currentPoints,
          needed: reward.point_cost - currentPoints
        },
        { status: 400 }
      );
    }

    // Create redemption record
    const redemptionData: NewRedemption = {
      reward_id: reward.id,
      points_spent: reward.point_cost,
      status: 'active',
    };

    const { data: redemption, error: redemptionError } = await supabase
      .from("redemptions")
      .insert(redemptionData)
      .select(`
        *,
        rewards (
          id,
          name,
          point_cost,
          image_url
        )
      `)
      .single();

    if (redemptionError) {
      console.error("Error creating redemption:", redemptionError);
      return NextResponse.json(
        { error: "Failed to redeem reward" },
        { status: 500 }
      );
    }

    // Calculate new point balance
    const newBalance = currentPoints - reward.point_cost;

    return NextResponse.json({
      redemption,
      message: "Reward redeemed successfully!",
      previous_balance: currentPoints,
      new_balance: newBalance,
      points_spent: reward.point_cost,
    });
  } catch (error) {
    console.error("Redemptions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 