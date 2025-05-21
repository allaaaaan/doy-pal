import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../types/database.types";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";

// OpenAI API info for generating embeddings
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Use the large model for better multilingual capabilities
const MODEL = "text-embedding-3-large";
const API_URL = "https://api.openai.com/v1/embeddings";

export async function POST(request: NextRequest) {
  try {
    // Check for environment variables
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables are missing", {
        supabaseUrl,
        supabaseKey,
      });
      throw new Error("Supabase environment variables are missing");
    }

    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      throw new Error("OpenAI API key is missing");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Parse the request body
    let body;
    try {
      body = await request.json();
      console.log("Request body:", body);
    } catch (err) {
      console.error("Failed to parse request body", err);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    // Lower default threshold for better cross-language matching
    const { text, threshold = 0.6, limit = 10 } = body;

    if (!text) {
      console.warn("Text is missing in request body");
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Generate embedding for the search text
    console.log("Requesting embedding from OpenAI API", { text });
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
      console.error("OpenAI API error response:", errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const embeddingData = await embeddingResponse.json();
    console.log("Received embedding data from OpenAI:", embeddingData);
    const embedding = embeddingData.data[0].embedding;

    // Query for similar events using the Postgres function
    console.log("Querying Supabase RPC 'find_similar_events'", {
      embedding,
      threshold,
      limit,
    });
    const { data: similarEvents, error } = await supabase.rpc(
      "find_similar_events",
      {
        search_embedding: embedding,
        similarity_threshold: threshold,
        max_results: limit,
      }
    );

    if (error) {
      console.error("Supabase RPC error:", error);
      throw error;
    }

    console.log("Similar events found:", similarEvents);
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
