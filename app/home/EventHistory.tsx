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
    <div>
      <h2 className="text-lg font-semibold mb-2">Event History</h2>
      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No events recorded yet</p>
      ) : (
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
      )}
    </div>
  );
}
