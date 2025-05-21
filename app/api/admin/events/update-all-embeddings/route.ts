import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../types/database.types";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";

// OpenAI API info
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "text-embedding-3-large";
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

    // Get all events that don't have embeddings yet
    const { data: events, error: fetchError } = await supabase
      .from("events")
      .select("id, description")
      .is("description_embedding", null)
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    if (!events || events.length === 0) {
      return NextResponse.json({
        message: "No events found that need embedding updates",
        updated: 0,
      });
    }

    console.log(`Found ${events.length} events that need embeddings`);

    // Process events in batches to avoid rate limits
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      console.log(
        `Processing batch ${i / batchSize + 1} of ${Math.ceil(
          events.length / batchSize
        )}`
      );

      // Process this batch in parallel
      const batchPromises = batch.map(async (event) => {
        if (!event.description) return null;

        try {
          // Generate embedding
          console.log(
            `Requesting embedding for event ${event.id}:`,
            event.description
          );
          const embeddingResponse = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: MODEL,
              input: event.description,
            }),
          });

          console.log(
            `OpenAI response status for event ${event.id}:`,
            embeddingResponse.status
          );
          let embeddingData = null;
          if (!embeddingResponse.ok) {
            const errorData = await embeddingResponse.json();
            console.error(`OpenAI API error for event ${event.id}:`, errorData);
            throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
          } else {
            embeddingData = await embeddingResponse.json();
            console.log(
              `Embedding generated for event ${event.id}, dimensions: ${embeddingData.data[0].embedding.length}`
            );
          }

          const embedding = embeddingData.data[0].embedding;

          // Update event with embedding
          const { data, error } = await supabase
            .from("events")
            .update({ description_embedding: embedding })
            .eq("id", event.id)
            .select("id")
            .single();

          if (error) throw error;
          console.log(`Successfully updated embedding for event ${event.id}`);

          return data;
        } catch (error) {
          console.error(`Error processing event ${event.id}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter((r) => r !== null));

      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < events.length) {
        console.log(`Waiting before processing next batch...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(
      `Finished processing all events. Updated ${results.length} of ${events.length}`
    );

    return NextResponse.json({
      message: "Events updated with embeddings successfully",
      updated: results.length,
      total: events.length,
    });
  } catch (error) {
    console.error("Error updating events with embeddings:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
