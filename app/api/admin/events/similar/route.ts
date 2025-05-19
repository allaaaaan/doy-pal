import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../types/database.types";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";

// OpenAI API info for generating embeddings
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "text-embedding-3-small";
const API_URL = "https://api.openai.com/v1/embeddings";

export async function POST(request: NextRequest) {
  try {
    // Check for environment variables
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing");
    }

    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is missing");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Parse the request body
    const body = await request.json();
    const { text, threshold = 0.7, limit = 10 } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Generate embedding for the search text
    const embeddingResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        input: text,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Query for similar events using the Postgres function
    const { data: similarEvents, error } = await supabase.rpc(
      "find_similar_events",
      {
        search_embedding: embedding,
        similarity_threshold: threshold,
        max_results: limit,
      }
    );

    if (error) throw error;

    return NextResponse.json({
      query: text,
      similarEvents: similarEvents || [],
    });
  } catch (error) {
    console.error("Error finding similar events:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
