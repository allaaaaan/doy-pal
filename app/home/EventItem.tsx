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
  const [formattedDate, setFormattedDate] = useState("");
  const [timeAgo, setTimeAgo] = useState("");
  const [actionsVisible, setActionsVisible] = useState(false);

  useEffect(() => {
    const eventDate = new Date(event.timestamp);
    setFormattedDate(format(eventDate, "MMM d, yyyy 'at' h:mm a"));
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

  return (
    <div className="relative overflow-hidden rounded-lg mb-3">
      {/* Main item content */}
      <div
        className={`bg-white dark:bg-gray-800 shadow p-4 flex flex-col gap-2 transition-transform duration-300 ease-in-out ${
          actionsVisible ? "transform -translate-x-20" : ""
        }`}
        onClick={toggleActions}
      >
        <div className="flex justify-between items-center">
          <div className="font-medium text-base line-clamp-2">
            {event.description}
          </div>
          <span className="flex items-center bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-semibold">
            <Award className="w-4 h-4 mr-1" /> {event.points} pts
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 items-center">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formattedDate}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {timeAgo}
          </span>
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
