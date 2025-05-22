import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../types/database.types";
import { translateAndGenerateEmbedding } from "@/app/utils/embeddings";

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

    // Translate the input text to English and generate embedding
    console.log("Processing query text for similarity search:", text);
    const { translatedText, embedding } = await translateAndGenerateEmbedding(
      text
    );

    console.log("Text processed:", {
      original: text,
      translated: translatedText,
      embeddingDimensions: embedding.length,
    });

    // Query for similar events using the Postgres function
    console.log("Querying Supabase RPC 'find_similar_events'", {
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
      query: {
        original: text,
        translated: translatedText,
      },
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
