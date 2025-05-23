import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const body = await request.json();
    const { is_active } = body;

    if (is_active === undefined) {
      return NextResponse.json(
        { error: "Missing required field: is_active" },
        { status: 400 }
      );
    }

    const { data: template, error } = await supabase
      .from("templates")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
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

    return NextResponse.json({
      template,
      message: `Template ${
        is_active ? "activated" : "deactivated"
      } successfully`,
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
