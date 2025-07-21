import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import { Database } from "../../types/database.types";

type Redemption = Database["public"]["Tables"]["redemptions"]["Row"];

// GET /api/redemptions/[id] - Get specific redemption
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: redemption, error } = await supabase
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
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching redemption:", error);
      return NextResponse.json(
        { error: "Redemption not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ redemption });
  } catch (error) {
    console.error("Redemption API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/redemptions/[id] - Withdraw/refund redemption
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action !== 'withdraw') {
      return NextResponse.json(
        { error: "Invalid action. Only 'withdraw' is supported" },
        { status: 400 }
      );
    }

    // Get current redemption details
    const { data: redemption, error: fetchError } = await supabase
      .from("redemptions")
      .select(`
        *,
        rewards (
          name
        )
      `)
      .eq("id", params.id)
      .single();

    if (fetchError || !redemption) {
      return NextResponse.json(
        { error: "Redemption not found" },
        { status: 404 }
      );
    }

    // Check if already withdrawn
    if (redemption.status === 'withdrawn') {
      return NextResponse.json(
        { error: "Redemption already withdrawn" },
        { status: 400 }
      );
    }

    // Update redemption status to withdrawn
    const { error: updateError } = await supabase
      .from("redemptions")
      .update({ status: 'withdrawn' })
      .eq("id", params.id);

    if (updateError) {
      console.error("Error withdrawing redemption:", updateError);
      return NextResponse.json(
        { error: "Failed to withdraw redemption" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Redemption withdrawn successfully",
      points_refunded: redemption.points_spent,
      reward_name: (redemption as any).rewards?.name || "Unknown Reward",
    });
  } catch (error) {
    console.error("Redemption API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 