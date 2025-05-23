"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import TemplateSelector from "../../components/TemplateSelector";
import TemplateQuickTip from "../../components/TemplateQuickTip";

interface Template {
  id: string;
  name: string;
  description: string;
  default_points: number;
  frequency: number;
  ai_confidence?: number;
}

export default function EventFormPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Set default date and time when component mounts
  useEffect(() => {
    const now = new Date();
    setDate(format(now, "yyyy-MM-dd"));
    setTime(format(now, "HH:mm"));
  }, []);

  // Update form when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setName(selectedTemplate.name);
      setDescription(selectedTemplate.description);
      setPoints(selectedTemplate.default_points);
    }
  }, [selectedTemplate]);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleTemplateSelect = (template: Template | null) => {
    setSelectedTemplate(template);
    if (!template) {
      // Reset form for manual entry
      setName("");
      setDescription("");
      setPoints(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast("Please enter an event description", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create timestamp from date and time inputs
      const timestamp = new Date(`${date}T${time}`);
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const eventData = {
        name: name.trim() || undefined, // Let API auto-generate if empty
        description: description.trim(),
        points,
        timestamp: timestamp.toISOString(),
        day_of_week: days[timestamp.getDay()],
        day_of_month: timestamp.getDate(),
        template_id: selectedTemplate?.id || null,
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) throw new Error("Failed to create event");

      showToast("Event added successfully! 🎉");

      // Reset form
      setSelectedTemplate(null);
      setName("");
      setDescription("");
      setPoints(1);
      formRef.current?.reset();

      // Navigate back after a brief delay to show success
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Error creating event:", error);
      showToast("Failed to create event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mobile-content">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Add Event
            </h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 mobile-safe-bottom space-y-6">
        {/* Quick Tip */}
        <TemplateQuickTip />

        {/* Template Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <TemplateSelector
            onTemplateSelect={handleTemplateSelect}
            selectedTemplate={selectedTemplate}
          />
        </div>

        {/* Event Form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 space-y-4"
        >
          {/* Event Name */}
          <div>
            <label
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              htmlFor="name"
            >
              Event Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-inherit text-inherit focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Give your event a name (optional)"
              disabled={isSubmitting}
            />
            {selectedTemplate && (
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                ✨ Auto-filled from template: {selectedTemplate.name}
              </p>
            )}
          </div>

          {/* Event Description */}
          <div>
            <label
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              htmlFor="description"
            >
              Event Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-inherit text-inherit focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder="What did your child do?"
              rows={3}
              disabled={isSubmitting}
            />
            {selectedTemplate && (
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                ✨ Auto-filled from template: {selectedTemplate.name}
              </p>
            )}
          </div>

          {/* Points */}
          <div>
            <label
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              htmlFor="points"
            >
              Points Earned
            </label>
            <div className="relative">
              <input
                type="number"
                id="points"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min="1"
                max="100"
                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-inherit text-inherit focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <StarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-yellow-500" />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                htmlFor="date"
              >
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-inherit text-inherit focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
                htmlFor="time"
              >
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-inherit text-inherit focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <ClockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-md hover:shadow-lg"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              "Save Event"
            )}
          </button>
        </form>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            💡 Tips
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5">
            <li>• Use templates for common events to save time</li>
            <li>• Events are automatically translated and analyzed with AI</li>
            <li>• Points help track your child's achievements</li>
            <li>
              • Name field is optional - it auto-generates from description
            </li>
          </ul>
        </div>
      </div>

      {/* Toast Notification */}
      {toastVisible && (
        <div
          className={`fixed bottom-4 left-4 right-4 mx-auto max-w-sm p-4 rounded-lg shadow-lg text-white text-center z-50 ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
