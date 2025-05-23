import { Database } from "../api/types/database.types";
import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  PencilIcon,
  TrashIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

type Event = Database["public"]["Tables"]["events"]["Row"] & {
  templates?: {
    id: string;
    name: string;
    ai_confidence?: number;
  } | null;
};

interface EventItemProps {
  event: Event;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function EventItem({ event, onDelete, onEdit }: EventItemProps) {
  const [timeAgo, setTimeAgo] = useState("");
  const [actionsVisible, setActionsVisible] = useState(false);

  useEffect(() => {
    const eventDate = new Date(event.timestamp);
    setTimeAgo(formatDistanceToNow(eventDate, { addSuffix: true }));
  }, [event.timestamp]);

  const toggleActions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionsVisible(!actionsVisible);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(event.id);
    setActionsVisible(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(event.id);
    setActionsVisible(false);
  };

  const eventDate = new Date(event.timestamp);

  return (
    <div className="relative overflow-hidden rounded-xl mb-3">
      {/* Main item content */}
      <div
        className={`bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300 ease-in-out hover:shadow-md ${
          actionsVisible ? "transform -translate-x-20" : ""
        }`}
        onClick={toggleActions}
      >
        {/* Template badge and points */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {/* Template indicator */}
            {event.templates && (
              <div className="flex items-center space-x-1 mb-2">
                <SparklesIcon className="h-3 w-3 text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {event.templates.name}
                </span>
                {event.templates.ai_confidence && (
                  <span className="text-xs text-gray-500">
                    ({Math.round(event.templates.ai_confidence * 100)}% match)
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <div className="font-medium text-base line-clamp-2 text-gray-900 dark:text-gray-100">
              {event.description}
            </div>
          </div>

          {/* Points badge */}
          <div className="flex items-center bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-3 py-1.5 rounded-full text-sm font-semibold shrink-0 ml-3">
            <StarIcon className="w-4 h-4 mr-1" />
            {event.points}
          </div>
        </div>

        {/* Date information row */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {/* Date and time */}
          <div className="flex items-center gap-x-4">
            <div className="flex items-center">
              <CalendarIcon className="w-3.5 h-3.5 mr-1" />
              <span>{format(eventDate, "MMM d, yyyy")}</span>
            </div>

            <div className="flex items-center">
              <ClockIcon className="w-3.5 h-3.5 mr-1" />
              <span>{format(eventDate, "h:mm a")}</span>
            </div>
          </div>

          {/* Day and time ago */}
          <div className="flex items-center">
            <span className="text-xs">{timeAgo.replace("about ", "")}</span>
          </div>
        </div>

        {actionsVisible && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <button
              onClick={toggleActions}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 transition-colors"
              aria-label="Close actions"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Action buttons (positioned to appear only when slid) */}
      <div
        className={`absolute top-0 right-0 h-full flex items-center transition-transform duration-300 ease-in-out ${
          actionsVisible
            ? "transform translate-x-0"
            : "transform translate-x-full"
        }`}
        style={{ width: "80px" }}
      >
        <button
          onClick={handleEdit}
          className="bg-blue-500 hover:bg-blue-600 text-white h-full w-10 flex items-center justify-center transition-colors"
          aria-label="Edit"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white h-full w-10 flex items-center justify-center transition-colors"
          aria-label="Archive"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
