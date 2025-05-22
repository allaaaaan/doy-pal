# Event Management API Documentation

This document covers the core event management API endpoints in Doy-Pal for creating, reading, updating, and deleting behavioral events.

## Overview

The Event Management APIs provide CRUD operations for behavioral events, which are the core data entities in the Doy-Pal application. These endpoints handle basic event operations while the admin APIs handle advanced AI-powered features.

## Base URL

Event endpoints are prefixed with `/api/events/`

## Authentication

Currently, event endpoints use Supabase service keys for authentication. Ensure proper environment variables are configured:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

---

## Endpoints

### Get All Events

**Endpoint**: `GET /api/events`

**Description**: Retrieve all behavioral events with optional filtering and pagination.

**Query Parameters**:

- `limit` (optional): Maximum number of events to return (default: 50)
- `offset` (optional): Number of events to skip for pagination (default: 0)
- `active_only` (optional): Filter to only active events (default: true)
- `order` (optional): Sort order - 'asc' or 'desc' (default: 'desc')

**Request Example**:

```http
GET /api/events?limit=20&offset=0&active_only=true&order=desc
```

**Response**:

```json
{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "description": "Helped set the table",
      "points": 2,
      "timestamp": "2024-01-15T18:30:00.000Z",
      "day_of_week": "Monday",
      "day_of_month": 15,
      "created_at": "2024-01-15T18:30:00.000Z",
      "updated_at": "2024-01-15T18:30:00.000Z",
      "is_active": true,
      "normalized_description": "helped set the table",
      "description_embedding": null
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**Features**:

- Automatic timestamp ordering (newest first)
- Soft delete filtering (only active events by default)
- Pagination support
- Includes AI fields when available

---

### Get Single Event

**Endpoint**: `GET /api/events/[id]`

**Description**: Retrieve a specific event by its UUID.

**Path Parameters**:

- `id`: UUID of the event

**Request Example**:

```http
GET /api/events/550e8400-e29b-41d4-a716-446655440000
```

**Response**:

```json
{
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Helped set the table",
    "points": 2,
    "timestamp": "2024-01-15T18:30:00.000Z",
    "day_of_week": "Monday",
    "day_of_month": 15,
    "created_at": "2024-01-15T18:30:00.000Z",
    "updated_at": "2024-01-15T18:30:00.000Z",
    "is_active": true,
    "normalized_description": "helped set the table",
    "description_embedding": [0.123, -0.456, ...]
  }
}
```

**Error Responses**:

```json
{
  "error": "Event not found"
}
```

**Status Codes**:

- `200`: Success
- `404`: Event not found
- `500`: Server error

---

### Create Event

**Endpoint**: `POST /api/events`

**Description**: Create a new behavioral event.

**Request Body**:

```json
{
  "description": "Brushed teeth without reminding",
  "points": 3,
  "timestamp": "2024-01-15T20:00:00.000Z"
}
```

**Parameters**:

- `description` (required): Text description of the behavior
- `points` (required): Point value (positive integer)
- `timestamp` (optional): When the event occurred (defaults to current time)

**Response**:

```json
{
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "description": "Brushed teeth without reminding",
    "points": 3,
    "timestamp": "2024-01-15T20:00:00.000Z",
    "day_of_week": "Monday",
    "day_of_month": 15,
    "created_at": "2024-01-15T20:00:00.000Z",
    "updated_at": "2024-01-15T20:00:00.000Z",
    "is_active": true,
    "normalized_description": null,
    "description_embedding": null
  }
}
```

**Features**:

- Automatic timestamp processing if not provided
- Automatic day_of_week and day_of_month calculation
- UUID generation for new events
- AI fields initialized as null (populated later via admin APIs)

**Validation**:

- Description cannot be empty
- Points must be positive integer
- Timestamp must be valid ISO 8601 format

---

### Update Event

**Endpoint**: `PATCH /api/events/[id]`

**Description**: Update an existing event's properties.

**Path Parameters**:

- `id`: UUID of the event to update

**Request Body**:

```json
{
  "description": "Helped set the dinner table",
  "points": 3
}
```

**Updateable Fields**:

- `description`: Event description
- `points`: Point value
- `timestamp`: When the event occurred
- `is_active`: Active status (for soft delete)

**Response**:

```json
{
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Helped set the dinner table",
    "points": 3,
    "timestamp": "2024-01-15T18:30:00.000Z",
    "day_of_week": "Monday",
    "day_of_month": 15,
    "created_at": "2024-01-15T18:30:00.000Z",
    "updated_at": "2024-01-15T20:15:00.000Z",
    "is_active": true,
    "normalized_description": null,
    "description_embedding": null
  }
}
```

**Features**:

- Partial updates (only provided fields are updated)
- Automatic updated_at timestamp
- Recalculates day_of_week and day_of_month if timestamp changes
- Clears AI fields if description changes (requires regeneration)

**Note**: If the description is updated, the `normalized_description` and `description_embedding` fields are cleared and will need to be regenerated using the admin APIs.

---

### Delete Event

**Endpoint**: `DELETE /api/events/[id]`

**Description**: Soft delete an event (sets is_active to false).

**Path Parameters**:

- `id`: UUID of the event to delete

**Response**:

```json
{
  "message": "Event deleted successfully",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": false
  }
}
```

**Features**:

- Soft delete (preserves data for recovery)
- Maintains historical data integrity
- Can be undone by updating is_active to true

---

## Points Summary API

### Get Points Summary

**Endpoint**: `GET /api/points`

**Description**: Get aggregated point totals across different time periods.

**Response**:

```json
{
  "summary": {
    "total_points": 127,
    "weekly_points": 23,
    "monthly_points": 89
  }
}
```

**Calculations**:

- `total_points`: Sum of all active events
- `weekly_points`: Points earned in current week (Sunday to Saturday)
- `monthly_points`: Points earned in current month

**Features**:

- Real-time calculations
- Only includes active events
- Timezone-aware calculations based on server time

---

## Data Flow and AI Integration

### Event Creation Flow

1. Event created via POST `/api/events`
2. Basic fields populated automatically
3. AI fields (`normalized_description`, `description_embedding`) remain null
4. Admin can later run `/api/admin/events/update-all-embeddings` to populate AI fields

### Event Update Flow

1. Event updated via PATCH `/api/events/[id]`
2. If description changes, AI fields are cleared
3. Admin must regenerate embeddings for updated events
4. Use `/api/admin/events/similar` to find related events

### Best Practices

- Generate embeddings after bulk event creation
- Regenerate embeddings when descriptions are significantly updated
- Use similarity search to avoid duplicate events
- Monitor points summaries for behavioral insights

---

## Error Handling

### Common Error Responses

**Validation Errors**:

```json
{
  "error": "Description is required"
}
```

**Not Found Errors**:

```json
{
  "error": "Event not found"
}
```

**Database Errors**:

```json
{
  "error": "Database connection failed"
}
```

### Status Codes

- `200`: Success (GET, PATCH)
- `201`: Created (POST)
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

---

## Usage Examples

### Basic Event Management

```javascript
// Create a new event
const createEvent = async (description, points) => {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description,
      points,
    }),
  });
  return await response.json();
};

// Get all events
const getEvents = async () => {
  const response = await fetch("/api/events?limit=20");
  return await response.json();
};

// Update an event
const updateEvent = async (id, updates) => {
  const response = await fetch(`/api/events/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  return await response.json();
};
```

### Event with AI Features

```javascript
// Create event and generate embedding
const createEventWithAI = async (description, points) => {
  // 1. Create the event
  const event = await createEvent(description, points);

  // 2. Generate embedding for immediate use
  if (event.event?.id) {
    await fetch("/api/admin/events/update-all-embeddings", {
      method: "POST",
    });
  }

  return event;
};

// Find similar events before creating
const checkSimilarBeforeCreate = async (description, points) => {
  // Check for similar events first
  const similarResponse = await fetch("/api/admin/events/similar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: description,
      threshold: 0.8,
      limit: 3,
    }),
  });

  const { similarEvents } = await similarResponse.json();

  if (similarEvents.length > 0) {
    console.log("Similar events found:", similarEvents);
    // Decide whether to create new event or update existing
  }

  // Create new event if no duplicates
  return await createEvent(description, points);
};
```

---

## Integration with Frontend

### React Hook Example

```javascript
const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      const newEvent = await response.json();
      setEvents((prev) => [newEvent.event, ...prev]);
      return newEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  return { events, loading, fetchEvents, createEvent };
};
```

---

_This API documentation covers all core event management functionality. For AI-powered features, refer to the [Admin API Documentation](./api-admin.md)._
