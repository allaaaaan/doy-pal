import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

    const { data: template, error } = await supabase
      .from("templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (error) {
      console.error("Error fetching template:", error);
      return NextResponse.json(
        { error: "Failed to fetch template" },
        { status: 500 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Template GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const body = await request.json();
    const {
      name,
      description,
      default_points,
      frequency,
      ai_confidence,
      is_active,
    } = body;

    // Build update object with only provided fields
    const updateFields: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (default_points !== undefined)
      updateFields.default_points = default_points;
    if (frequency !== undefined) updateFields.frequency = frequency;
    if (ai_confidence !== undefined) updateFields.ai_confidence = ai_confidence;
    if (is_active !== undefined) updateFields.is_active = is_active;

    // Validate required fields if provided
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: "Template name cannot be empty" },
        { status: 400 }
      );
    }

    if (description !== undefined && !description.trim()) {
      return NextResponse.json(
        { error: "Template description cannot be empty" },
        { status: 400 }
      );
    }

    if (
      default_points !== undefined &&
      (default_points < 1 || default_points > 100)
    ) {
      return NextResponse.json(
        { error: "Default points must be between 1 and 100" },
        { status: 400 }
      );
    }

    const { data: template, error } = await supabase
      .from("templates")
      .update(updateFields)
      .eq("id", templateId)
      .select()
      .single();

    if (error) {
      console.error("Error updating template:", error);
      return NextResponse.json(
        { error: "Failed to update template" },
        { status: 500 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      template,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error("Template PATCH API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;

    const { error } = await supabase
      .from("templates")
      .delete()
      .eq("id", templateId);

    if (error) {
      console.error("Error deleting template:", error);
      return NextResponse.json(
        { error: "Failed to delete template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Template DELETE API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
