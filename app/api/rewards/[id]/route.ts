import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";
import { Database } from "../../types/database.types";

type Reward = Database["public"]["Tables"]["rewards"]["Row"];
type UpdateReward = Database["public"]["Tables"]["rewards"]["Update"];

// GET /api/rewards/[id] - Get specific reward
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: reward, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching reward:", error);
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ reward });
  } catch (error) {
    console.error("Reward API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/rewards/[id] - Update reward
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const pointCost = formData.get("point_cost") ? parseInt(formData.get("point_cost") as string) : null;
    const isActive = formData.get("is_active") ? formData.get("is_active") === "true" : null;
    const image = formData.get("image") as File | null;

    // Get current reward to check for existing image
    const { data: currentReward, error: fetchError } = await supabase
      .from("rewards")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      );
    }

    let imageUrl: string | null = currentReward.image_url;

    // Handle new image upload
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

      // Delete old image if exists
      if (currentReward.image_url) {
        const oldFileName = currentReward.image_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from("reward-images")
            .remove([oldFileName]);
        }
      }

      // Upload new image
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = image.name.split('.').pop() || 'jpg';
      const fileName = `reward-${timestamp}-${randomString}.${fileExtension}`;

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

    // Build update object with only provided fields
    const updateData: UpdateReward = {};
    
    if (name) updateData.name = name;
    if (description !== null) updateData.description = description || null;
    if (pointCost !== null) updateData.point_cost = pointCost;
    if (isActive !== null) updateData.is_active = isActive;
    if (imageUrl !== currentReward.image_url) updateData.image_url = imageUrl;

    // Update reward in database
    const { data: reward, error: dbError } = await supabase
      .from("rewards")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to update reward" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reward,
      message: "Reward updated successfully",
    });
  } catch (error) {
    console.error("Reward API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/rewards/[id] - Delete/deactivate reward
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current reward to access image
    const { data: currentReward, error: fetchError } = await supabase
      .from("rewards")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from("rewards")
      .update({ is_active: false })
      .eq("id", params.id);

    if (deleteError) {
      console.error("Database error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete reward" },
        { status: 500 }
      );
    }

    // Optionally delete image from storage (uncomment if you want to delete images)
    // if (currentReward.image_url) {
    //   const fileName = currentReward.image_url.split('/').pop();
    //   if (fileName) {
    //     await supabase.storage
    //       .from("reward-images")
    //       .remove([fileName]);
    //   }
    // }

    return NextResponse.json({
      message: "Reward deactivated successfully",
    });
  } catch (error) {
    console.error("Reward API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 