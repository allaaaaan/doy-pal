"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Database } from "../api/types/database.types";
import EventHistory from "./EventHistory";
import { format } from "date-fns";

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
      description: string;
      points: number;
      timestamp: string;
      day_of_week: string;
      day_of_month: number;
    }
  ) => void;
}) => {
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
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
                htmlFor="edit-description"
              >
                Description
              </label>
              <input
                type="text"
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md bg-inherit text-inherit"
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
    try {
      const response = await fetch("/api/events");
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
    try {
      const response = await fetch("/api/points");
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
      setIsLoading(true);
      await Promise.all([fetchEvents(), fetchPointSummary()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <main className="max-w-md mx-auto p-4 pb-24">
        <h1 className="text-2xl font-bold mb-6 text-center">Doy Pal</h1>
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto h-screen overflow-hidden flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Doy Pal</h1>
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Total Points</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">All time</p>
        </div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
          {pointSummary?.total_points || 0}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <EventHistory
          events={events}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
      <Link
        href="/event"
        className="fixed bottom-20 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-3xl shadow-lg dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
        aria-label="Add Event"
      >
        +
      </Link>
      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} />
      <EditModal
        event={editingEvent}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
      />
    </main>
  );
}
