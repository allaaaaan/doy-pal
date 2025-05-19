"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Database } from "../api/types/database.types";
import Link from "next/link";

type Event = Database["public"]["Tables"]["events"]["Row"];
type PointSummary = Database["public"]["Views"]["point_summaries"]["Row"];

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pointSummary, setPointSummary] = useState<PointSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchPointSummary();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/admin/events");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to fetch events: ${response.statusText}`
        );
      }

      const data = await response.json();
      setEvents(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch events";
      setError(errorMessage);
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPointSummary = async () => {
    try {
      const response = await fetch("/api/points");
      if (!response.ok) {
        console.error("Failed to fetch point summary");
        return;
      }
      const data = await response.json();
      setPointSummary(data);
    } catch (err) {
      console.error("Error fetching point summary:", err);
    }
  };

  const toggleEventStatus = async (event: Event) => {
    try {
      setActionLoading(event.id);
      const newStatus = event.is_active === false ? true : false;

      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update event status");
      }

      // Refresh the events list and point summary
      await Promise.all([fetchEvents(), fetchPointSummary()]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update event";
      console.error("Error toggling event status:", err);
      alert(`Error: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <div className="text-center p-6">Loading events data...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-md mb-4">
          <p className="font-semibold">Error loading data:</p>
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <button
            onClick={fetchEvents}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mr-4"
          >
            Retry
          </button>
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Events Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all events in the system. This table shows all
            events including inactive ones.
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
            Total Points
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
            {pointSummary?.total_points || 0}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Points
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Day of Week
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Day of Month
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Created At
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
            {events.length > 0 ? (
              events.map((event) => {
                const eventDate = new Date(event.timestamp);

                return (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      <span className="text-xs font-mono">{event.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {event.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {event.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {format(eventDate, "yyyy-MM-dd")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {format(eventDate, "HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {event.day_of_week}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {event.day_of_month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {event.created_at
                        ? format(
                            new Date(event.created_at),
                            "yyyy-MM-dd HH:mm:ss"
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.is_active !== false
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {event.is_active !== false ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => toggleEventStatus(event)}
                        disabled={actionLoading === event.id}
                        className={`px-2 py-1 text-xs rounded ${
                          event.is_active !== false
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                            : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                        }`}
                      >
                        {actionLoading === event.id
                          ? "..."
                          : event.is_active !== false
                          ? "Archive"
                          : "Restore"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
