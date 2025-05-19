import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Database } from "../../types/database.types";

export async function GET() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;

    // Check if environment variables are available
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing");
    }

    // Initialize Supabase client
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Fetch all events including inactive ones
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching admin events:", error);
    return NextResponse.json(
      {
        message: "Error fetching events",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
