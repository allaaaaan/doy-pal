import { Database } from "../api/types/database.types";
import EventItem from "./EventItem";

type Event = Database["public"]["Tables"]["events"]["Row"];

interface EventHistoryProps {
  events: Event[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function EventHistory({
  events,
  onDelete,
  onEdit,
}: EventHistoryProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Activity
        </h2>
        {events.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No events recorded yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Start tracking your child's achievements!
          </p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto pr-1 -mr-1">
          <div className="space-y-3">
            {events.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
