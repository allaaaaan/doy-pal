/**
 * Utility functions for text translation and embeddings generation
 * AI FEATURES DISABLED - Returns dummy data instead of API calls
 */

// AI functionality disabled - these constants are kept for compatibility
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
 * AI FEATURES DISABLED: Returns dummy data instead of API calls
 * @param text The text to be processed
 * @returns Object containing original text as translated text and empty embedding
 */
export async function translateAndGenerateEmbedding(
  text: string
): Promise<TranslationEmbeddingResult> {
  console.log("AI features disabled - returning dummy data");
  
  // Return the original text as both original and translated
  // Return empty array as embedding to avoid AI processing
  return {
    originalText: text,
    translatedText: text, // No translation - return original text
    embedding: [], // Empty embedding array
  };
}

/**
 * AI FEATURES DISABLED: Returns original text without translation
 * @param text Text to translate
 * @returns Original text unchanged
 */
async function translateToEnglish(text: string): Promise<string> {
  console.log("AI translation disabled - returning original text");
  return text; // Return original text without translation
}

/**
 * AI FEATURES DISABLED: Returns empty array instead of generating embeddings
 * @param text Text to embed
 * @returns Empty array
 */
async function generateEmbedding(text: string): Promise<number[]> {
  console.log("AI embedding generation disabled - returning empty array");
  return []; // Return empty array instead of generating embeddings
}
