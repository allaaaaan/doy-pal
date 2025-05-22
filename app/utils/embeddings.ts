/**
 * Utility functions for text translation and embeddings generation
 */

// OpenAI API info
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-3-large";
const EMBEDDING_API_URL = "https://api.openai.com/v1/embeddings";
const TRANSLATION_MODEL = "gpt-4o";
const TRANSLATION_API_URL = "https://api.openai.com/v1/chat/completions";

// Type definitions
export type TranslationEmbeddingResult = {
  originalText: string;
  translatedText: string;
  embedding: number[];
};

/**
 * Translates text to English (if not already in English) and generates an embedding
 * @param text The text to be translated and embedded
 * @returns Object containing original text, translated text, and embedding
 */
export async function translateAndGenerateEmbedding(
  text: string
): Promise<TranslationEmbeddingResult> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing");
  }

  try {
    // Step 1: Translate to English if needed
    const translatedText = await translateToEnglish(text);
    console.log("Translated text:", translatedText);

    // Step 2: Generate embedding from translated text
    const embedding = await generateEmbedding(translatedText);
    console.log("Generated embedding of length:", embedding.length);

    return {
      originalText: text,
      translatedText,
      embedding,
    };
  } catch (error) {
    console.error("Error in translateAndGenerateEmbedding:", error);
    throw error;
  }
}

/**
 * Translates text to English using OpenAI's model
 * @param text Text to translate
 * @returns English translation
 */
async function translateToEnglish(text: string): Promise<string> {
  // Skip translation for empty strings
  if (!text || text.trim() === "") {
    return text;
  }

  try {
    console.log("Requesting translation from OpenAI API");
    const translationResponse = await fetch(TRANSLATION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: TRANSLATION_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a translator. Translate the following text to English. If the text is already in English, return it unchanged. Preserve the original meaning, tone, and style as much as possible.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
      }),
    });

    if (!translationResponse.ok) {
      const errorData = await translationResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const translationData = await translationResponse.json();
    return translationData.choices[0].message.content.trim();
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

/**
 * Generates an embedding for the provided text using OpenAI's embedding model
 * @param text Text to embed
 * @returns Vector embedding as an array of numbers
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Return empty array for empty text
  if (!text || text.trim() === "") {
    return [];
  }

  try {
    console.log("Requesting embedding from OpenAI API");
    const embeddingResponse = await fetch(EMBEDDING_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const embeddingData = await embeddingResponse.json();
    return embeddingData.data[0].embedding;
  } catch (error) {
    console.error("Embedding generation error:", error);
    throw error;
  }
}
