import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profile_id');

    if (!profileId) {
      return NextResponse.json({ error: 'profile_id is required' }, { status: 400 });
    }

    const { data: templates, error } = await supabase
      .from("templates")
      .select("*")
      .eq("is_active", true)
      .eq("profile_id", profileId)
      .order("frequency", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Templates API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, default_points, frequency, ai_confidence, profile_id } =
      body;

    if (!name || !description || default_points === undefined || !profile_id) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, default_points, profile_id" },
        { status: 400 }
      );
    }

    const { data: template, error } = await supabase
      .from("templates")
      .insert({
        name,
        description,
        default_points,
        frequency: frequency || 0,
        ai_confidence: ai_confidence || null,
        profile_id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating template:", error);
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      );
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Template creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
