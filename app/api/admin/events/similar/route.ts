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
  console.log("AI similarity search disabled - returning empty results");
  
  // Parse the request body to maintain API compatibility
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text } = body;
  
  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  // Return empty results since AI features are disabled
  return NextResponse.json({
    query: {
      original: text,
      translated: text, // No translation since AI is disabled
    },
    similarEvents: [], // Empty array since AI similarity search is disabled
    message: "AI similarity search is disabled"
  });
}
