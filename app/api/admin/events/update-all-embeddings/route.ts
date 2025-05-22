import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../types/database.types";
import { translateAndGenerateEmbedding } from "@/app/utils/embeddings";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || "";

export async function POST(request: NextRequest) {
  try {
    // Check for environment variables
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Get all events that need processing - either no embedding or no normalized description
    const { data: events, error: fetchError } = await supabase
      .from("events")
      .select("id, description")
      .or("description_embedding.is.null, normalized_description.is.null")
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    if (!events || events.length === 0) {
      return NextResponse.json({
        message: "No events found that need embedding updates",
        updated: 0,
      });
    }

    console.log(`Found ${events.length} events that need processing`);

    // Process events in batches to avoid rate limits
    const batchSize = 3; // Smaller batch size due to more API calls per event
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
          console.log(
            `Processing event ${
              event.id
            }, description: "${event.description.substring(0, 50)}..."`
          );

          // Generate translation and embedding
          const result = await translateAndGenerateEmbedding(event.description);

          console.log(
            `Event ${
              event.id
            } processed: Original: "${event.description.substring(
              0,
              30
            )}...", ` +
              `Translated: "${result.translatedText.substring(0, 30)}...", ` +
              `Embedding dimensions: ${result.embedding.length}`
          );

          // Update event with normalized description and embedding
          const { data, error } = await supabase
            .from("events")
            .update({
              normalized_description: result.translatedText,
              description_embedding: result.embedding,
            })
            .eq("id", event.id)
            .select("id")
            .single();

          if (error) throw error;
          console.log(
            `Successfully updated event ${event.id} with normalized description and embedding`
          );

          return data;
        } catch (error) {
          console.error(`Error processing event ${event.id}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter((r) => r !== null));

      // Add a delay between batches to avoid rate limits
      if (i + batchSize < events.length) {
        console.log(`Waiting before processing next batch...`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Longer delay due to multiple API calls
      }
    }

    console.log(
      `Finished processing all events. Updated ${results.length} of ${events.length}`
    );

    return NextResponse.json({
      message: "Events updated with translations and embeddings successfully",
      updated: results.length,
      total: events.length,
    });
  } catch (error) {
    console.error(
      "Error updating events with translations and embeddings:",
      error
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
