"use client";

import { useState, useEffect } from "react";

interface UnlinkedEvent {
  id: string;
  name: string;
  description: string;
  normalized_description: string | null;
  points: number;
  timestamp: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  default_points: number;
  ai_confidence: number;
}

interface LinkSuggestion {
  event_id: string;
  template_id: string;
  confidence: number;
  reason: string;
}

interface LinkData {
  unlinked_events: UnlinkedEvent[];
  templates: Template[];
  summary: {
    unlinked_count: number;
    templates_count: number;
  };
}

export default function LinkEventsPage() {
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<{ [key: string]: string }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchLinkData();
  }, []);

  const fetchLinkData = async () => {
    try {
      const response = await fetch("/api/admin/link-events-templates");
      const data = await response.json();

      if (response.ok) {
        setLinkData(data);
      } else {
        setError(data.error || "Failed to fetch link data");
      }
    } catch (err) {
      setError("Network error fetching link data");
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    setGenerating(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await fetch("/api/admin/link-events-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "generate_suggestions" }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuggestions(data.suggestions || []);

        // Pre-populate selected links with suggestions
        const newSelectedLinks: { [key: string]: string } = {};
        data.suggestions.forEach((suggestion: LinkSuggestion) => {
          newSelectedLinks[suggestion.event_id] = suggestion.template_id;
        });
        setSelectedLinks(newSelectedLinks);

        setSuccess(`Generated ${data.suggestions.length} AI suggestions`);
      } else {
        setError(data.error || "Failed to generate suggestions");
      }
    } catch (err) {
      setError("Network error generating suggestions");
    } finally {
      setGenerating(false);
    }
  };

  const linkSingleEvent = async (eventId: string, templateId: string) => {
    try {
      const response = await fetch("/api/admin/link-events-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "link_single",
          event_id: eventId,
          template_id: templateId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Event linked successfully");
        await fetchLinkData(); // Refresh data
      } else {
        setError(data.error || "Failed to link event");
      }
    } catch (err) {
      setError("Network error linking event");
    }
  };

  const batchLinkEvents = async () => {
    setLinking(true);
    setError(null);

    try {
      const linksToApply = Object.entries(selectedLinks)
        .filter(([eventId, templateId]) => templateId && templateId !== "")
        .map(([eventId, templateId]) => ({
          event_id: eventId,
          template_id: templateId,
        }));

      if (linksToApply.length === 0) {
        setError("No links selected");
        setLinking(false);
        return;
      }

      const response = await fetch("/api/admin/link-events-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "batch_link",
          batch_link: linksToApply,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          `Batch linking completed: ${data.summary.successful} successful, ${data.summary.failed} failed`
        );
        setSelectedLinks({});
        setSuggestions([]);
        await fetchLinkData(); // Refresh data
      } else {
        setError(data.error || "Failed to batch link events");
      }
    } catch (err) {
      setError("Network error during batch linking");
    } finally {
      setLinking(false);
    }
  };

  const handleTemplateSelect = (eventId: string, templateId: string) => {
    setSelectedLinks((prev) => ({
      ...prev,
      [eventId]: templateId,
    }));
  };

  const getSuggestionForEvent = (eventId: string) => {
    return suggestions.find((s) => s.event_id === eventId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">
          Loading link data...
        </div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">
          Failed to load data
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Link Events to Templates
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Temporary tool to connect existing events with AI-generated
                templates
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={generateSuggestions}
                disabled={generating || linkData.unlinked_events.length === 0}
                className={`px-6 py-2 rounded-lg font-medium ${
                  generating || linkData.unlinked_events.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                } text-white transition-colors`}
              >
                {generating ? "Generating..." : "AI Suggestions"}
              </button>
              <button
                onClick={batchLinkEvents}
                disabled={linking || Object.keys(selectedLinks).length === 0}
                className={`px-6 py-2 rounded-lg font-medium ${
                  linking || Object.keys(selectedLinks).length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                } text-white transition-colors`}
              >
                {linking
                  ? "Linking..."
                  : `Link Selected (${Object.keys(selectedLinks).length})`}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {linkData.summary.unlinked_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Unlinked Events
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {linkData.summary.templates_count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Available Templates
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {suggestions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                AI Suggestions
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        {linkData.unlinked_events.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              All Events Linked!
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              All existing events have been linked to templates.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Unlinked Events ({linkData.unlinked_events.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Template Selection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      AI Suggestion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {linkData.unlinked_events.map((event) => {
                    const suggestion = getSuggestionForEvent(event.id);
                    const selectedTemplate = linkData.templates.find(
                      (t) => t.id === selectedLinks[event.id]
                    );

                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                              {event.normalized_description ||
                                event.description}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                            {event.points} pts
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={selectedLinks[event.id] || ""}
                            onChange={(e) =>
                              handleTemplateSelect(event.id, e.target.value)
                            }
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Select Template...</option>
                            {linkData.templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name} ({template.default_points} pts)
                              </option>
                            ))}
                          </select>
                          {selectedTemplate && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {selectedTemplate.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {suggestion ? (
                            <div className="text-sm">
                              <div
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  suggestion.confidence >= 0.8
                                    ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                                    : "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                                }`}
                              >
                                {(suggestion.confidence * 100).toFixed(0)}%
                                confident
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {suggestion.reason}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-sm">
                              No suggestion
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() =>
                              linkSingleEvent(event.id, selectedLinks[event.id])
                            }
                            disabled={!selectedLinks[event.id]}
                            className={`${
                              selectedLinks[event.id]
                                ? "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            Link Now
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
