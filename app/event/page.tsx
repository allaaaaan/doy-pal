"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function EventFormPage() {
  const router = useRouter();
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

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
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

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          points,
          timestamp: timestamp.toISOString(),
          day_of_week: days[timestamp.getDay()],
          day_of_month: timestamp.getDate(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create event");

      showToast("Event added successfully");
      setDescription("");
      setPoints(1);
      formRef.current?.reset();
      router.push("/");
    } catch (error) {
      console.error("Error creating event:", error);
      showToast("Failed to create event", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Back to List
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-center">Add Event</h1>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm mb-6"
      >
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="description"
          >
            Event Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md bg-inherit text-inherit"
            placeholder="What did your child do?"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="points">
            Points
          </label>
          <input
            type="number"
            id="points"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            min="1"
            className="w-full p-2 border rounded-md bg-inherit text-inherit"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="date">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded-md bg-inherit text-inherit"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="time">
            Time
          </label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 border rounded-md bg-inherit text-inherit"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className={`bg-blue-500 text-white py-2 px-4 rounded-md w-full ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Event"}
        </button>
      </form>
      {toastVisible && (
        <div
          className={`fixed bottom-4 left-0 right-0 mx-auto w-[90%] max-w-sm p-3 rounded-md shadow-md text-white text-center ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </main>
  );
}
