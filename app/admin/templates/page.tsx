"use client";

import { useState, useEffect } from "react";

interface Template {
  id: string;
  name: string;
  description: string;
  default_points: number;
  frequency: number;
  last_seen: string;
  ai_confidence: number;
  is_active: boolean;
  created_at: string;
}

interface AnalysisResult {
  success: boolean;
  batch_id: string;
  analyzed_events: number;
  templates_generated: number;
  message: string;
}

export default function TemplatesAdminPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();

      if (response.ok) {
        setTemplates(data.templates || []);
      } else {
        setError(data.error || "Failed to fetch templates");
      }
    } catch (err) {
      setError("Network error fetching templates");
    } finally {
      setLoading(false);
    }
  };

  const analyzeTemplates = async () => {
    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/admin/analyze-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAnalysisResult(data);
        await fetchTemplates(); // Refresh templates list
      } else {
        setError(data.error || "Failed to analyze templates");
      }
    } catch (err) {
      setError("Network error during analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleTemplate = async (templateId: string, isActive: boolean) => {
    try {
      // This would need a PATCH endpoint for templates
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        await fetchTemplates();
      } else {
        setError("Failed to update template");
      }
    } catch (err) {
      setError("Network error updating template");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-lg">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              AI Template Management
            </h1>
            <button
              onClick={analyzeTemplates}
              disabled={analyzing}
              className={`px-6 py-2 rounded-lg font-medium ${
                analyzing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white transition-colors`}
            >
              {analyzing ? "Analyzing..." : "Analyze Latest Events"}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {analysisResult && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-medium">Analysis Complete!</p>
              <p>{analysisResult.message}</p>
              <p className="text-sm mt-1">
                Batch ID: {analysisResult.batch_id}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600 mb-4">
            Current templates: {templates.length} | Cost-effective AI analysis
            on demand
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              No Templates Found
            </h2>
            <p className="text-gray-500 mb-4">
              Click "Analyze Latest Events" to generate AI-powered templates
              from your event data.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-lg font-medium text-gray-900">
                Active Templates
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {template.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {template.default_points} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {template.frequency} times
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {template.ai_confidence ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              template.ai_confidence >= 0.8
                                ? "bg-green-100 text-green-800"
                                : template.ai_confidence >= 0.6
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {(template.ai_confidence * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.last_seen
                          ? new Date(template.last_seen).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() =>
                            toggleTemplate(template.id, template.is_active)
                          }
                          className={`${
                            template.is_active
                              ? "text-red-600 hover:text-red-900"
                              : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {template.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
