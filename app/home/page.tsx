"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Database } from "../api/types/database.types";
import EventHistory from "./EventHistory";
import { format } from "date-fns";
import FloatingActionButton from "../../components/FloatingActionButton";
import ProfileSwitcher from "../../components/ProfileSwitcher";
import { useProfile } from "../contexts/ProfileContext";
import { APP_VERSION } from "../version";

type Event = Database["public"]["Tables"]["events"]["Row"];
type PointSummary = Database["public"]["Views"]["point_summaries"]["Row"];

// Modal Component for Editing
const EditModal = ({
  event,
  isOpen,
  onClose,
  onSave,
}: {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updatedEvent: {
      name?: string;
      description: string;
      points: number;
      timestamp: string;
      day_of_week: string;
      day_of_month: number;
    }
  ) => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setName(event.name || "");
      setDescription(event.description);
      setPoints(event.points);

      // Parse event timestamp to set date and time
      const eventDate = new Date(event.timestamp);
      setDate(format(eventDate, "yyyy-MM-dd"));
      setTime(format(eventDate, "HH:mm"));
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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

    onSave(event.id, {
      name: name.trim() || undefined,
      description,
      points,
      timestamp: timestamp.toISOString(),
      day_of_week: days[timestamp.getDay()],
      day_of_month: timestamp.getDate(),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="p-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Edit Event
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="edit-name"
              >
                Event Name
              </label>
              <input
                type="text"
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md bg-inherit text-inherit"
                placeholder="Event name (optional)"
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="edit-description"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md bg-inherit text-inherit resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="edit-points"
              >
                Points
              </label>
              <input
                type="number"
                id="edit-points"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min="1"
                className="w-full p-2 border rounded-md bg-inherit text-inherit"
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="edit-date"
              >
                Date
              </label>
              <input
                type="date"
                id="edit-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded-md bg-inherit text-inherit"
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="edit-time"
              >
                Time
              </label>
              <input
                type="time"
                id="edit-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 border rounded-md bg-inherit text-inherit"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-500 text-white rounded-md ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Toast component
const Toast = ({
  message,
  isVisible,
  type,
}: {
  message: string;
  isVisible: boolean;
  type: "success" | "error";
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 left-0 right-0 mx-auto w-[90%] max-w-sm p-3 rounded-md shadow-md text-white text-center ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
    </div>
  );
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export default function EventListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pointSummary, setPointSummary] = useState<PointSummary | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { currentProfile } = useProfile();

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const fetchEvents = async () => {
    if (!currentProfile) return;
    
    try {
      const response = await fetch(`/api/events?limit=5&profile_id=${currentProfile.id}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      console.log(data);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      showToast("Failed to load events", "error");
    }
  };

  const fetchPointSummary = async () => {
    if (!currentProfile) return;
    
    try {
      const response = await fetch(`/api/points?profile_id=${currentProfile.id}`);
      if (!response.ok) throw new Error("Failed to fetch points");
      const data = await response.json();
      setPointSummary(data);
    } catch (error) {
      console.error("Error fetching points:", error);
      showToast("Failed to load points summary", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to archive event");
      await fetchEvents();
      await fetchPointSummary();
      showToast("Event archived successfully");
    } catch (error) {
      console.error("Error archiving event:", error);
      showToast("Failed to archive event", "error");
    }
  };

  const handleEdit = (id: string) => {
    const eventToEdit = events.find((event) => event.id === id);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async (
    id: string,
    updatedEvent: {
      name?: string;
      description: string;
      points: number;
      timestamp: string;
      day_of_week: string;
      day_of_month: number;
    }
  ) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) throw new Error("Failed to update event");

      // Close modal and refresh data
      setIsEditModalOpen(false);
      setEditingEvent(null);
      await fetchEvents();
      await fetchPointSummary();
      showToast("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      showToast("Failed to update event", "error");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!currentProfile) return;
      
      setIsLoading(true);
      await Promise.all([fetchEvents(), fetchPointSummary()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [currentProfile]); // Re-run when currentProfile changes

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">Doy Pal</h1>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono align-top mt-1">v{APP_VERSION}</span>
              </div>
              <ProfileSwitcher />
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">Doy Pal</h1>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono align-top mt-1">v{APP_VERSION}</span>
            </div>
            <ProfileSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Points Summary Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold mb-1">Total Points</h2>
              <p className="text-blue-100 text-sm">All time achievements</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {pointSummary?.total_points || 0}
              </div>
              <div className="text-blue-100 text-sm">
                {events.length} events
              </div>
            </div>
          </div>
          
          {/* Redeem Button */}
          {(pointSummary?.total_points || 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-400">
              <Link
                href="/redeem"
                className="block w-full py-3 px-4 bg-white/20 hover:bg-white/30 text-white text-center rounded-lg font-medium transition-colors backdrop-blur-sm"
              >
                🎁 Redeem Rewards
              </Link>
            </div>
          )}
        </div>

        {/* Event History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <EventHistory
            events={events}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      </div>

      <FloatingActionButton />
      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} />
      <EditModal
        event={editingEvent}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
