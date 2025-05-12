"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// Mock event data
interface Event {
  id: string;
  description: string;
  points: number;
  timestamp: Date;
  dayOfWeek: string;
  dayOfMonth: number;
}

const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    description: "Helped set the table for dinner",
    points: 2,
    timestamp: new Date(2023, 11, 1, 17, 30),
    dayOfWeek: "Friday",
    dayOfMonth: 1,
  },
  {
    id: "2",
    description: "Brushed teeth before bed without reminding",
    points: 1,
    timestamp: new Date(2023, 11, 1, 21, 0),
    dayOfWeek: "Friday",
    dayOfMonth: 1,
  },
  {
    id: "3",
    description: "Cleaned up toys after playing",
    points: 3,
    timestamp: new Date(2023, 11, 2, 15, 45),
    dayOfWeek: "Saturday",
    dayOfMonth: 2,
  },
];

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

const formatDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function EventListPage() {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(1);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const formRef = useRef<HTMLFormElement>(null);

  const totalPoints = events.reduce((sum, event) => sum + event.points, 0);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      showToast("Please enter an event description", "error");
      return;
    }

    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    if (editingEvent) {
      // Update existing event
      setEvents(
        events.map((event) =>
          event.id === editingEvent.id
            ? { ...event, description, points }
            : event
        )
      );
      showToast("Event updated successfully");
    } else {
      // Add new event
      const newEvent: Event = {
        id: Date.now().toString(),
        description,
        points,
        timestamp: now,
        dayOfWeek: days[now.getDay()],
        dayOfMonth: now.getDate(),
      };
      setEvents([newEvent, ...events]);
      showToast("Event added successfully");
    }

    // Reset form
    setDescription("");
    setPoints(1);
    setEditingEvent(null);
    formRef.current?.reset();
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setDescription(event.description);
    setPoints(event.points);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
    showToast("Event deleted");
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setDescription("");
    setPoints(1);
  };

  return (
    <main className="max-w-md mx-auto p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6 text-center">Doy-Pal</h1>
      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Total Points</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">All time</p>
        </div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
          {totalPoints}
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-2">Event History</h2>
      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No events recorded yet</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm"
            >
              <div className="flex justify-between">
                <div className="font-medium">{event.description}</div>
                <div className="font-bold text-blue-600 dark:text-blue-300">
                  +{event.points}
                </div>
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {formatDate(event.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
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
