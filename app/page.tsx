"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

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

export default function Home() {
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

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <main className="max-w-md mx-auto p-4">
      {" "}
      <h1 className="text-2xl font-bold mb-6 text-center">Doy-Pal</h1>{" "}
      <div className="bg-blue-50 p-4 rounded-md mb-6 flex justify-between items-center">
        {" "}
        <div>
          {" "}
          <h2 className="text-lg font-semibold">Total Points</h2>{" "}
          <p className="text-sm text-gray-600">All time</p>{" "}
        </div>{" "}
        <div className="text-3xl font-bold text-blue-600">{totalPoints}</div>{" "}
      </div>{" "}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-md shadow-sm mb-6"
      >
        {" "}
        <h2 className="text-lg font-semibold mb-4">
          {" "}
          {editingEvent ? "Edit Event" : "Add New Event"}{" "}
        </h2>{" "}
        <div className="mb-4">
          {" "}
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="description"
          >
            {" "}
            Event Description{" "}
          </label>{" "}
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="What did your child do?"
          />{" "}
        </div>{" "}
        <div className="mb-4">
          {" "}
          <label className="block text-sm font-medium mb-1" htmlFor="points">
            {" "}
            Points{" "}
          </label>{" "}
          <input
            type="number"
            id="points"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            min="1"
            className="w-full p-2 border rounded-md"
          />{" "}
        </div>{" "}
        <div className="flex gap-2">
          {" "}
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md flex-grow"
          >
            {" "}
            {editingEvent ? "Update Event" : "Add Event"}{" "}
          </button>{" "}
          {editingEvent && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-300 py-2 px-4 rounded-md"
            >
              {" "}
              Cancel{" "}
            </button>
          )}{" "}
        </div>{" "}
      </form>{" "}
      <h2 className="text-lg font-semibold mb-2">Event History</h2>{" "}
      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No events recorded yet</p>
      ) : (
        <div className="space-y-3">
          {" "}
          {events.map((event) => (
            <div key={event.id} className="bg-white p-3 rounded-md shadow-sm">
              {" "}
              <div className="flex justify-between">
                {" "}
                <div className="font-medium">{event.description}</div>{" "}
                <div className="font-bold text-blue-600">+{event.points}</div>{" "}
              </div>{" "}
              <div className="text-gray-500 text-sm mt-1">
                {" "}
                {formatDate(event.timestamp)}{" "}
              </div>{" "}
              <div className="flex gap-2 mt-2">
                {" "}
                <button
                  onClick={() => handleEdit(event)}
                  className="text-sm text-blue-600 flex-grow text-center py-1 border border-blue-200 rounded-md"
                >
                  {" "}
                  Edit{" "}
                </button>{" "}
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-sm text-red-600 flex-grow text-center py-1 border border-red-200 rounded-md"
                >
                  {" "}
                  Delete{" "}
                </button>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        type={toastType}
      />{" "}
    </main>
  );
}
