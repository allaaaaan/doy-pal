"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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

interface TemplateFormData {
  name: string;
  description: string;
  default_points: number;
  ai_confidence?: number;
}

export default function TemplatesAdminPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    description: "",
    default_points: 1,
    ai_confidence: undefined,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const deleteTemplate = async (templateId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this template? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTemplates();
      } else {
        setError("Failed to delete template");
      }
    } catch (err) {
      setError("Network error deleting template");
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          default_points: formData.default_points,
          ai_confidence: formData.ai_confidence,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          name: "",
          description: "",
          default_points: 1,
          ai_confidence: undefined,
        });
        await fetchTemplates();
      } else {
        setFormError(data.error || "Failed to create template");
      }
    } catch (err) {
      setFormError("Network error creating template");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setFormLoading(true);
    setFormError(null);

    try {
      const response = await fetch(`/api/templates/${editingTemplate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          default_points: formData.default_points,
          ai_confidence: formData.ai_confidence,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEditingTemplate(null);
        setFormData({
          name: "",
          description: "",
          default_points: 1,
          ai_confidence: undefined,
        });
        await fetchTemplates();
      } else {
        setFormError(data.error || "Failed to update template");
      }
    } catch (err) {
      setFormError("Network error updating template");
    } finally {
      setFormLoading(false);
    }
  };

  const startEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      default_points: template.default_points,
      ai_confidence: template.ai_confidence,
    });
    setFormError(null);
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setShowCreateForm(false);
    setFormData({
      name: "",
      description: "",
      default_points: 1,
      ai_confidence: undefined,
    });
    setFormError(null);
  };

  const TemplateForm = ({ isEditing = false }: { isEditing?: boolean }) => (
    <form
      onSubmit={isEditing ? handleEditTemplate : handleCreateTemplate}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Template Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g., Household chores"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g., Helped with cleaning and organizing tasks"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Default Points
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={formData.default_points}
          onChange={(e) =>
            setFormData({
              ...formData,
              default_points: parseInt(e.target.value),
            })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          AI Confidence (Optional)
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          value={formData.ai_confidence || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              ai_confidence: e.target.value
                ? parseFloat(e.target.value)
                : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="0.0 - 1.0"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Leave blank for manually created templates
        </p>
      </div>

      {formError && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm">
          {formError}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={cancelEdit}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formLoading}
          className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
            formLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          }`}
        >
          {formLoading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Template"
            : "Create Template"}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-lg text-gray-900 dark:text-white">
          Loading templates...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Template Management
            </h1>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Template
              </button>
              <button
                onClick={analyzeTemplates}
                disabled={analyzing}
                className={`px-6 py-2 rounded-lg font-medium ${
                  analyzing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                } text-white transition-colors`}
              >
                {analyzing ? "Analyzing..." : "Analyze Latest Events"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {analysisResult && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
              <p className="font-medium">Analysis Complete!</p>
              <p>{analysisResult.message}</p>
              <p className="text-sm mt-1">
                Batch ID: {analysisResult.batch_id}
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Current templates: {templates.length} | Mix of AI-generated and
            manually created templates
          </div>
        </div>

        {/* Create Template Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Create New Template
              </h2>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <TemplateForm />
          </div>
        )}

        {/* Edit Template Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Edit Template
                </h2>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <TemplateForm isEditing={true} />
            </div>
          </div>
        )}

        {/* Templates List */}
        {templates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              No Templates Found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first template manually or click "Analyze Latest
              Events" to generate AI-powered templates.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                All Templates
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      AI Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  {templates.map((template) => (
                    <tr
                      key={template.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {template.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                          {template.default_points} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {template.frequency} times
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {template.ai_confidence ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              template.ai_confidence >= 0.8
                                ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
                                : template.ai_confidence >= 0.6
                                ? "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                                : "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200"
                            }`}
                          >
                            {(template.ai_confidence * 100).toFixed(0)}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {template.last_seen
                          ? new Date(template.last_seen).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEdit(template)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            toggleTemplate(template.id, template.is_active)
                          }
                          className={`${
                            template.is_active
                              ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          }`}
                        >
                          {template.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
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
