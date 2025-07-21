import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../lib/supabase";
import { Database } from "../types/database.types";

type Reward = Database["public"]["Tables"]["rewards"]["Row"];
type NewReward = Database["public"]["Tables"]["rewards"]["Insert"];

// GET /api/rewards - List active rewards with redemption status
export async function GET() {
  try {
    const { data: rewards, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("is_active", true)
      .order("point_cost", { ascending: true });

    if (error) {
      console.error("Error fetching rewards:", error);
      return NextResponse.json(
        { error: "Failed to fetch rewards" },
        { status: 500 }
      );
    }

    // Process rewards to add redemption status
    const rewardsWithStatus = await Promise.all(
      rewards?.map(async (reward) => {
        // Check if this reward has been redeemed (and not withdrawn)
        const { data: activeRedemption } = await supabase
          .from("redemptions")
          .select("id, redeemed_at")
          .eq("reward_id", reward.id)
          .eq("status", "active")
          .single();

        return {
          ...reward,
          is_redeemed: !!activeRedemption,
          redeemed_at: activeRedemption?.redeemed_at || null
        };
      }) || []
    );

    return NextResponse.json({ rewards: rewardsWithStatus });
  } catch (error) {
    console.error("Rewards API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/rewards - Create new reward with image upload
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointCost = parseInt(formData.get("point_cost") as string);
    const image = formData.get("image") as File | null;

    // Validate required fields
    if (!name || !pointCost || pointCost <= 0) {
      return NextResponse.json(
        { error: "Missing required fields: name and valid point_cost" },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    // Handle image upload if provided
    if (image && image.size > 0) {
      // Validate image
      if (image.size > 1024 * 1024) { // 1MB limit
        return NextResponse.json(
          { error: "Image size must be less than 1MB" },
          { status: 400 }
        );
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(image.type)) {
        return NextResponse.json(
          { error: "Image must be JPEG, PNG, or WebP format" },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = image.name.split('.').pop() || 'jpg';
      const fileName = `reward-${timestamp}-${randomString}.${fileExtension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("reward-images")
        .upload(fileName, image, {
          contentType: image.type,
          upsert: false
        });

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("reward-images")
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    // Create reward in database
    const rewardData: NewReward = {
      name,
      description: description || null,
      point_cost: pointCost,
      image_url: imageUrl,
      is_active: true,
    };

    const { data: reward, error: dbError } = await supabase
      .from("rewards")
      .insert(rewardData)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      
      // Clean up uploaded image if database insert fails
      if (imageUrl) {
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from("reward-images")
            .remove([fileName]);
        }
      }

      return NextResponse.json(
        { error: "Failed to create reward" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reward,
      message: "Reward created successfully",
    });
  } catch (error) {
    console.error("Rewards API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 