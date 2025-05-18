import { Database } from "../api/types/database.types";
import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Edit,
  Trash2,
  Award,
  Calendar,
  Clock,
  ChevronLeft,
} from "lucide-react";

type Event = Database["public"]["Tables"]["events"]["Row"];

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
    <div className="relative overflow-hidden rounded-lg mb-3">
      {/* Main item content */}
      <div
        className={`bg-white dark:bg-gray-800 shadow p-4 transition-transform duration-300 ease-in-out ${
          actionsVisible ? "transform -translate-x-20" : ""
        }`}
        onClick={toggleActions}
      >
        {/* Description and points */}
        <div className="flex justify-between items-start mb-2">
          <div className="font-medium text-base line-clamp-2 pr-2">
            {event.description}
          </div>
          <div className="flex items-center bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-semibold shrink-0">
            <Award className="w-3.5 h-3.5 mr-1" /> {event.points} pts
          </div>
        </div>

        {/* Date information row */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {/* Date */}
          <div className="flex items-center gap-x-3">
            <div className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              <span>{format(eventDate, "MMM d, yyyy")}</span>
            </div>

            {/* Time */}
            <div className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>{format(eventDate, "h:mm a")}</span>
            </div>
          </div>

          {/* Day and time ago */}
          <div className="flex items-center">
            <span>{event.day_of_week}</span>
            <span className="mx-1 text-gray-400">•</span>
            <span>{timeAgo.replace("about ", "")}</span>
          </div>
        </div>

        {actionsVisible && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <button
              onClick={toggleActions}
              className="text-gray-500 p-2"
              aria-label="Close actions"
            >
              <ChevronLeft size={16} />
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
          className="bg-blue-500 text-white h-full w-10 flex items-center justify-center"
          aria-label="Edit"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white h-full w-10 flex items-center justify-center"
          aria-label="Archive"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
