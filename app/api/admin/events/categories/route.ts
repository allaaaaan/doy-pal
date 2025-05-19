import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../types/database.types";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";

export async function GET(request: NextRequest) {
  try {
    // Check for environment variables
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Get threshold from query params or use default
    const url = new URL(request.url);
    const threshold = parseFloat(url.searchParams.get("threshold") || "0.8");

    // Query for categories using the Postgres function
    const { data: categories, error } = await supabase.rpc(
      "categorize_events",
      { similarity_threshold: threshold }
    );

    if (error) throw error;

    return NextResponse.json({
      categories: categories || [],
      threshold,
    });
  } catch (error) {
    console.error("Error categorizing events:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
