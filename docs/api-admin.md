# Admin API Documentation

This document covers the administrative API endpoints in Doy-Pal, focusing on the latest AI-powered features for event management and analysis.

## Overview

The Admin APIs provide powerful tools for managing events, generating embeddings, performing similarity searches, and analyzing behavioral patterns. These endpoints are designed for administrative use and include advanced AI capabilities.

## Base URL

All admin endpoints are prefixed with `/api/admin/`

## Authentication

Currently, admin endpoints use Supabase service keys for authentication. Ensure proper environment variables are configured:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `OPENAI_API_KEY`

---

## Event Management APIs

### Get Event Categories

**Endpoint**: `GET /api/admin/events/categories`

**Description**: Automatically categorize events based on embedding similarity.

**Query Parameters**:

- `threshold` (optional): Similarity threshold for grouping (default: 0.8)
  - Range: 0.0 - 1.0
  - Higher values = stricter grouping

**Request Example**:

```http
GET /api/admin/events/categories?threshold=0.75
```

**Response**:

```json
{
  "categories": [
    {
      "category_id": 1,
      "sample_description": "helped with meal preparation",
      "event_count": 8
    },
    {
      "category_id": 2,
      "sample_description": "cleaned bedroom",
      "event_count": 5
    }
  ],
  "threshold": 0.75
}
```

**Features**:

- Automatic grouping by semantic similarity
- Representative sample for each category
- Event count per category
- Configurable similarity threshold

---

### Find Similar Events

**Endpoint**: `POST /api/admin/events/similar`

**Description**: Find events similar to input text using AI embeddings and semantic search.

**Request Body**:

```json
{
  "text": "helped clean the kitchen",
  "threshold": 0.6,
  "limit": 10
}
```

**Parameters**:

- `text` (required): Text to search for similar events
- `threshold` (optional): Similarity threshold (default: 0.6)
  - Range: 0.0 - 1.0
  - Lower values = more results, less strict matching
- `limit` (optional): Maximum number of results (default: 10)

**Response**:

```json
{
  "query": {
    "original": "helped clean the kitchen",
    "translated": "helped clean the kitchen"
  },
  "similarEvents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "description": "wiped down kitchen counters",
      "points": 3,
      "timestamp": "2024-01-15T14:30:00.000Z",
      "day_of_week": "Monday",
      "is_active": true,
      "similarity": 0.87
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "description": "ayudó a limpiar la cocina",
      "points": 4,
      "timestamp": "2024-01-14T16:20:00.000Z",
      "day_of_week": "Sunday",
      "is_active": true,
      "similarity": 0.82
    }
  ]
}
```

**Features**:

- Multilingual search capability
- Real-time translation and embedding generation
- Configurable similarity thresholds
- Cross-language matching
- Detailed similarity scores

**Error Responses**:

```json
{
  "error": "Text is required"
}
```

**Status Codes**:

- `200`: Success
- `400`: Bad request (missing text)
- `500`: Server error

---

### Update All Event Embeddings

**Endpoint**: `POST /api/admin/events/update-all-embeddings`

**Description**: Batch process all events to generate embeddings and translations for those that don't have them.

**Request Body**: None (empty POST request)

**Process**:

1. Identifies events missing embeddings or normalized descriptions
2. Processes events in batches of 3 (rate limiting)
3. For each event:
   - Translates description to English
   - Generates vector embedding
   - Updates database with both values
4. Includes 2-second delay between batches

**Response**:

```json
{
  "message": "Events updated with translations and embeddings successfully",
  "updated": 15,
  "total": 20
}
```

**Response Fields**:

- `message`: Status message
- `updated`: Number of events successfully updated
- `total`: Total number of events that needed processing

**Progress Logging**:
The endpoint provides detailed console logging:

```
Found 20 events that need processing
Processing batch 1 of 7
Processing event 550e8400-..., description: "helped with meal preparation..."
Event 550e8400-... processed: Original: "helped with meal...", Translated: "helped with meal...", Embedding dimensions: 1536
Successfully updated event 550e8400-... with normalized description and embedding
Waiting before processing next batch...
Finished processing all events. Updated 15 of 20
```

**Error Handling**:

- Individual event failures don't stop batch processing
- Detailed error logging for each failure
- Graceful handling of API rate limits
- Transaction rollback on database errors

**Performance Considerations**:

- **Rate Limiting**: 3 events per batch with 2-second delays
- **Processing Time**: ~2-3 seconds per batch + API call time
- **API Costs**: 2 OpenAI API calls per event (translation + embedding)
- **Recommended Usage**: Run during off-peak hours

---

## Database Functions Used

### find_similar_events()

```sql
find_similar_events(
  search_embedding vector(1536),
  similarity_threshold float,
  max_results int
)
```

**Used by**: `/api/admin/events/similar`

### categorize_events()

```sql
categorize_events(
  similarity_threshold float DEFAULT 0.8
)
```

**Used by**: `/api/admin/events/categories`

---

## Error Handling

### Common Error Responses

**Missing Environment Variables**:

```json
{
  "error": "Supabase environment variables are missing"
}
```

**OpenAI API Errors**:

```json
{
  "error": "OpenAI API key is missing"
}
```

**Invalid JSON**:

```json
{
  "error": "Invalid JSON body"
}
```

**Database Errors**:

```json
{
  "error": "Database connection failed"
}
```

### Status Codes

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `500`: Internal Server Error (API/database issues)

---

## Usage Examples

### Batch Processing Workflow

```javascript
// 1. Update all embeddings
const updateResponse = await fetch("/api/admin/events/update-all-embeddings", {
  method: "POST",
});

// 2. Get event categories
const categoriesResponse = await fetch(
  "/api/admin/events/categories?threshold=0.8"
);

// 3. Find similar events
const similarResponse = await fetch("/api/admin/events/similar", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "helped with chores",
    threshold: 0.7,
    limit: 5,
  }),
});
```

### Similarity Search Implementation

```javascript
async function findSimilarEvents(description, threshold = 0.6) {
  try {
    const response = await fetch("/api/admin/events/similar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: description,
        threshold: threshold,
        limit: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.similarEvents;
  } catch (error) {
    console.error("Error finding similar events:", error);
    throw error;
  }
}
```

---

## Recent Updates

### Latest Changes

1. **Enhanced Similarity Search**: Improved cross-language matching with translation pipeline
2. **Batch Processing**: Efficient bulk embedding generation with rate limiting
3. **Better Error Handling**: Detailed logging and graceful error recovery
4. **Performance Optimization**: Reduced API calls and improved processing speed

### Migration Notes

- Events without embeddings will be automatically processed
- Translation normalization improves cross-language matching
- Database schema includes new `normalized_description` column
- Vector index optimization for faster similarity searches

---

_This documentation reflects the latest implementation of the admin APIs with AI-powered features._
