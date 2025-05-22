# Database Schema Documentation

This document provides comprehensive details about the Doy-Pal database schema, including the latest additions for AI embeddings and multilingual support.

## Overview

Doy-Pal uses PostgreSQL with Supabase as the database backend. The schema supports core event tracking functionality along with advanced AI features including vector embeddings for similarity search and automatic translation support.

## Extensions

### Required PostgreSQL Extensions

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;
```

## Tables

### events

The main table storing all behavioral events with embeddings support.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points > 0),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  day_of_week TEXT NOT NULL,
  day_of_month INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,

  -- AI Enhancement Fields (Latest Additions)
  description_embedding vector(1536),
  normalized_description TEXT
);
```

#### Column Details

**Core Event Fields**:

- `id`: Unique identifier (UUID)
- `description`: Original event description in any language
- `points`: Points awarded for the behavior (positive integer)
- `timestamp`: When the event occurred
- `day_of_week`: Extracted day of week for analytics
- `day_of_month`: Extracted day of month for analytics
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp
- `is_active`: Soft delete flag (allows hiding without deletion)

**AI Enhancement Fields**:

- `description_embedding`: Vector embedding (1536 dimensions)
  - Generated from `normalized_description`
  - Uses OpenAI's `text-embedding-3-large` model
  - Enables semantic similarity search
- `normalized_description`: English translation of the description
  - Used for consistent embedding generation
  - Generated automatically via OpenAI translation
  - Improves cross-language similarity matching

#### Constraints and Validation

- `points > 0`: Ensures positive point values only
- `description NOT NULL`: Event must have a description
- `id` as UUID: Globally unique identifiers

## Views

### point_summaries

Aggregated view providing point calculations across different time periods.

```sql
CREATE OR REPLACE VIEW point_summaries AS
SELECT
  SUM(points) AS total_points,
  SUM(CASE
    WHEN timestamp >= DATE_TRUNC('week', CURRENT_TIMESTAMP)
    THEN points
    ELSE 0
  END) AS weekly_points,
  SUM(CASE
    WHEN timestamp >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
    THEN points
    ELSE 0
  END) AS monthly_points
FROM events
WHERE is_active = true;
```

#### Fields

- `total_points`: Sum of all active events
- `weekly_points`: Points earned in current week
- `monthly_points`: Points earned in current month

## Indexes

### Performance Optimization Indexes

```sql
-- Core query optimization
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_day_of_week ON events(day_of_week);
CREATE INDEX idx_events_day_of_month ON events(day_of_month);
CREATE INDEX idx_events_is_active ON events(is_active);

-- AI features optimization
CREATE INDEX idx_events_normalized_description ON events(normalized_description);

-- Vector similarity search (ivfflat for approximate nearest neighbor)
CREATE INDEX events_description_embedding_idx
ON events USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 100);
```

#### Index Usage

- **Performance Indexes**: Speed up date-based queries and filtering
- **Normalized Description**: Improves text-based search performance
- **Vector Index**: Enables fast similarity search using cosine distance
  - Uses `ivfflat` algorithm for approximate nearest neighbor search
  - Configured with 100 lists for optimal performance
  - Supports cosine distance operations (`<=>`)

## Functions

### find_similar_events()

Function to find events similar to a given embedding vector.

```sql
CREATE OR REPLACE FUNCTION find_similar_events(
  search_embedding vector(1536),
  similarity_threshold float,
  max_results int
)
RETURNS TABLE (
  id uuid,
  description text,
  points int,
  timestamp timestamptz,
  day_of_week text,
  is_active boolean,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.description,
    e.points,
    e.timestamp,
    e.day_of_week,
    e.is_active,
    1 - (e.description_embedding <=> search_embedding) as similarity
  FROM events e
  WHERE e.description_embedding IS NOT NULL
  AND e.is_active = true
  AND 1 - (e.description_embedding <=> search_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$;
```

#### Parameters

- `search_embedding`: Vector to search for similarities
- `similarity_threshold`: Minimum similarity score (0.0-1.0)
- `max_results`: Maximum number of results to return

#### Features

- Uses cosine similarity for semantic matching
- Only searches active events with embeddings
- Returns similarity score for ranking
- Configurable threshold and result limits

### categorize_events()

Function to automatically group events by similarity.

```sql
CREATE OR REPLACE FUNCTION categorize_events(
  similarity_threshold float DEFAULT 0.8
)
RETURNS TABLE (
  category_id int,
  sample_description text,
  event_count int
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Creates temporary categories based on similarity clustering
  -- Returns representative samples and counts for each category
  -- (Implementation details in scripts/add_embedding_column.sql)
END;
$$;
```

#### Features

- Dynamic category creation based on similarity
- Representative sample selection
- Event count per category
- Configurable similarity threshold

## Triggers

### Auto-update Timestamp

Automatically updates the `updated_at` column when records are modified.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data

### Initial Data

```sql
INSERT INTO events (description, points, day_of_week, day_of_month)
VALUES
  ('Helped set the table', 2, 'Monday', 1),
  ('Brushed teeth without reminding', 1, 'Monday', 1)
ON CONFLICT DO NOTHING;
```

## Migration History

### Initial Schema (20240320000000_init.sql)

- Created basic `events` table
- Added `point_summaries` view
- Created performance indexes
- Added update timestamp trigger

### Embedding Support (add_embedding_column.sql)

- Added `description_embedding` vector column
- Created vector similarity index
- Added `find_similar_events()` function
- Added `categorize_events()` function

### Multilingual Support (add_normalized_description.sql)

- Added `normalized_description` column
- Created text search index
- Added support for translation storage

## TypeScript Types

### Database Type Definitions

```typescript
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          description: string;
          points: number;
          timestamp: string;
          day_of_week: string;
          day_of_month: number;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          description_embedding?: number[];
          normalized_description?: string;
        };
        Insert: {
          id?: string;
          description: string;
          points: number;
          timestamp?: string;
          day_of_week: string;
          day_of_month: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          description_embedding?: number[];
          normalized_description?: string;
        };
        Update: {
          id?: string;
          description?: string;
          points?: number;
          timestamp?: string;
          day_of_week?: string;
          day_of_month?: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          description_embedding?: number[];
          normalized_description?: string;
        };
      };
    };
    Views: {
      point_summaries: {
        Row: {
          total_points: number;
          weekly_points: number;
          monthly_points: number;
        };
      };
    };
  };
}
```

## Performance Considerations

### Query Optimization

- Use indexes for date-based filtering
- Leverage vector index for similarity searches
- Consider `is_active = true` in WHERE clauses
- Use appropriate similarity thresholds (0.6-0.8)

### Vector Operations

- Vector similarity operations are computationally expensive
- Use appropriate similarity thresholds to limit results
- Consider caching frequently accessed embeddings
- Monitor query performance with large datasets

### Storage

- Vector embeddings add ~6KB per event (1536 floats)
- Consider archiving strategies for large datasets
- Monitor database size growth with embedding storage

## Backup and Recovery

### Critical Data

- Core `events` table with all behavioral data
- Generated embeddings (expensive to regenerate)
- Normalized descriptions (require API calls to recreate)

### Recovery Considerations

- Embeddings can be regenerated using `/api/admin/events/update-all-embeddings`
- Translations can be regenerated from original descriptions
- Vector indexes are automatically rebuilt on restore

---

_This schema documentation reflects the current state including all AI enhancements and multilingual support features._
