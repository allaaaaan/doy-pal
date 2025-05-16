"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Database } from "../api/types/database.types";
import EventHistory from "./EventHistory";

type Event = Database["public"]["Tables"]["events"]["Row"];
type PointSummary = Database["public"]["Views"]["point_summaries"]["Row"];

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
      if (!response.ok) throw new Error("Failed to delete event");
      await fetchEvents();
      await fetchPointSummary();
      showToast("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("Failed to delete event", "error");
    }
  };

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality (e.g., open edit modal or navigate to edit page)
    console.log("Edit event", id);
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
        <h1 className="text-2xl font-bold mb-6 text-center">Doy-Pal</h1>
        <div className="text-center">Loading...</div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 text-center">Doy-Pal</h1>
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Total Points</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">All time</p>
        </div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
          {pointSummary?.total_points || 0}
        </div>
      </div>
      <EventHistory
        events={events}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      <Link
        href="/event"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-3xl shadow-lg dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
        aria-label="Add Event"
      >
        +
      </Link>
      <Toast message={toastMessage} isVisible={toastVisible} type={toastType} />
    </main>
  );
}
