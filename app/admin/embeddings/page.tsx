"use client";

import { useState } from "react";
import Link from "next/link";

interface SimilarEvent {
  id: string;
  description: string;
  normalized_description: string | null;
  points: number;
  timestamp: string;
  day_of_week: string;
  is_active: boolean;
  similarity: number;
}

interface Category {
  category_id: number;
  sample_description: string;
  event_count: number;
}

export default function EmbeddingsAdminPage() {
  const [text, setText] = useState("");
  const [originalQuery, setOriginalQuery] = useState("");
  const [translatedQuery, setTranslatedQuery] = useState("");
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [similarEvents, setSimilarEvents] = useState<SimilarEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    updated: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const findSimilarEvents = async () => {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    setError(null);
    setSimilarEvents([]);
    setOriginalQuery("");
    setTranslatedQuery("");
    setIsSearching(true);

    try {
      const response = await fetch("/api/admin/events/similar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          threshold: similarityThreshold,
          limit: 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to find similar events");
      }

      const data = await response.json();
      setSimilarEvents(data.similarEvents);
      setOriginalQuery(data.query.original);
      setTranslatedQuery(data.query.translated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error finding similar events:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const loadCategories = async () => {
    setError(null);
    setCategories([]);
    setIsLoadingCategories(true);

    try {
      const response = await fetch(
        `/api/admin/events/categories?threshold=${similarityThreshold}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load categories");
      }

      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error loading categories:", err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const updateAllEmbeddings = async () => {
    setError(null);
    setBatchResult(null);
    setBatchProcessing(true);

    try {
      const response = await fetch("/api/admin/events/update-all-embeddings", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update embeddings");
      }

      const data = await response.json();
      setBatchResult({
        updated: data.updated,
        total: data.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error updating embeddings:", err);
    } finally {
      setBatchProcessing(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Embeddings Management</h1>
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Admin
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Generate and manage AI embeddings for event descriptions
        </p>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-md mb-4">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Find Similar Events</h2>

          <div className="mb-4">
            <label htmlFor="query" className="block text-sm font-medium mb-2">
              Enter text to search (any language)
            </label>
            <textarea
              id="query"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter event description to find similar events"
            ></textarea>
          </div>

          <div className="mb-4">
            <label
              htmlFor="threshold"
              className="block text-sm font-medium mb-2"
            >
              Similarity Threshold ({similarityThreshold})
            </label>
            <input
              type="range"
              id="threshold"
              min="0.5"
              max="0.95"
              step="0.05"
              value={similarityThreshold}
              onChange={(e) =>
                setSimilarityThreshold(parseFloat(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5 (Less similar)</span>
              <span>0.95 (More similar)</span>
            </div>
          </div>

          <div className="flex space-x-3 mb-6">
            <button
              onClick={findSimilarEvents}
              disabled={isSearching || !text.trim()}
              className={`px-4 py-2 rounded-md ${
                isSearching
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isSearching ? "Searching..." : "Find Similar Events"}
            </button>

            <button
              onClick={loadCategories}
              disabled={isLoadingCategories}
              className={`px-4 py-2 rounded-md ${
                isLoadingCategories
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
              }`}
            >
              {isLoadingCategories ? "Loading..." : "Show Event Categories"}
            </button>
          </div>

          {translatedQuery && originalQuery !== translatedQuery && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Translation:
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {translatedQuery}
              </p>
            </div>
          )}

          {similarEvents.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Similar Events</h3>
              <div className="overflow-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Normalized
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Points
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Similarity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {similarEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {event.description}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {event.normalized_description &&
                          event.normalized_description !== event.description ? (
                            <span className="italic">
                              {event.normalized_description}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {event.points}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {formatDate(event.timestamp)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {event.is_active ? "Active" : "Archived"}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {(event.similarity * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Event Categories</h3>
              <div className="overflow-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Sample Event
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {categories.map((category) => (
                      <tr
                        key={category.category_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          Category {category.category_id}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {category.sample_description}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {category.event_count} events
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Batch Process All Events
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This will process all events that need updating:
          </p>
          <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <li>
              Translate descriptions to English (if not already in English)
            </li>
            <li>Generate embeddings from the English text</li>
            <li>Store both translations and embeddings in the database</li>
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This operation may take some time depending on the number of events.
          </p>

          <button
            onClick={updateAllEmbeddings}
            disabled={batchProcessing}
            className={`px-4 py-2 rounded-md ${
              batchProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {batchProcessing ? "Processing..." : "Process Events"}
          </button>

          {batchResult && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md">
              <p className="font-semibold">Batch Processing Complete</p>
              <p>
                Updated {batchResult.updated} of {batchResult.total} events with
                translations and embeddings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
