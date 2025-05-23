"use client";

import { useState, useEffect } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Template {
  id: string;
  name: string;
  description: string;
  default_points: number;
  frequency: number;
  ai_confidence?: number;
}

interface TemplateSelectorProps {
  onTemplateSelect: (template: Template | null) => void;
  selectedTemplate: Template | null;
}

export default function TemplateSelector({
  onTemplateSelect,
  selectedTemplate,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleManualEntry = () => {
    onTemplateSelect(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        Quick Start
      </label>

      {/* Selected template display or dropdown trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
      >
        {selectedTemplate ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {selectedTemplate.name}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {selectedTemplate.default_points} pts
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTemplateSelect(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
              <ChevronDownIcon
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Choose a template or create manually
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        )}
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-inherit text-inherit focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Templates list */}
          <div className="max-h-60 overflow-y-auto">
            {/* Manual entry option */}
            <button
              type="button"
              onClick={handleManualEntry}
              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✎</span>
                </div>
                <div>
                  <div className="font-medium text-sm">Create Manually</div>
                  <div className="text-xs text-gray-500">
                    Enter custom event details
                  </div>
                </div>
              </div>
            </button>

            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading templates...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm
                  ? "No templates match your search"
                  : "No templates available"}
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {template.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {template.default_points} pts
                      </span>
                      {template.frequency > 0 && (
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {template.frequency}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
