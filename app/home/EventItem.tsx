import { Database } from "../api/types/database.types";
import { format, formatDistanceToNow } from "date-fns";
import { Edit, Trash2, Award, Calendar, Clock } from "lucide-react";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface EventItemProps {
  event: Event;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function EventItem({ event, onDelete, onEdit }: EventItemProps) {
  const eventDate = new Date(event.timestamp);
  const formattedDate = format(eventDate, "MMM d, yyyy 'at' h:mm a");
  const timeAgo = formatDistanceToNow(eventDate, { addSuffix: true });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 flex flex-col gap-2">
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
      <div className="flex gap-2 justify-end mt-2">
        <button
          onClick={() => onEdit(event.id)}
          className="flex items-center px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <Edit className="w-4 h-4 mr-1" /> Edit
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="flex items-center px-3 py-1 rounded bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </button>
      </div>
    </div>
  );
}
