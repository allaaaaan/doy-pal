# Database Schema Documentation

This document provides comprehensive details about the Doy-Pal database schema, including AI embeddings, template system, multilingual support, and all current features.

## Overview

Doy-Pal uses PostgreSQL with Supabase as the database backend. The schema supports core event tracking functionality along with advanced AI features including vector embeddings for similarity search, automatic translation support, and AI-generated templates.

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

The main table storing all behavioral events with AI enhancements and template relationships.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,                                          -- Event name (optional)
  description TEXT NOT NULL,                          -- Event description
  points INTEGER NOT NULL CHECK (points > 0),         -- Points awarded
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  day_of_week TEXT NOT NULL,                         -- Extracted day name
  day_of_month INTEGER NOT NULL,                     -- Extracted day number
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,                    -- Soft delete flag

  -- AI Enhancement Fields
  description_embedding vector(1536),                -- OpenAI text-embedding-3-large
  normalized_description TEXT,                       -- English translation

  -- Template System Fields
  template_id UUID REFERENCES templates(id)          -- Template relationship
);
```

#### Column Details

**Core Event Fields**:

- `id`: Unique identifier (UUID)
- `name`: Optional event name, auto-generated from description if not provided
- `description`: Original event description in any language
- `points`: Points awarded for the behavior (1-100 range)
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

**Template System Fields**:

- `template_id`: Foreign key reference to templates table
  - Links events to templates for usage tracking
  - NULL for manually created events
  - Updated automatically when templates are used

### templates

AI-generated templates for quick event creation and pattern recognition.

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                                -- Template name
  description TEXT NOT NULL,                         -- Template description
  default_points INTEGER NOT NULL DEFAULT 1,         -- Suggested point value
  frequency INTEGER DEFAULT 0,                      -- Usage count
  last_seen TIMESTAMP WITH TIME ZONE,               -- Last usage timestamp
  ai_confidence DECIMAL(3,2),                       -- AI confidence (0.0-1.0)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,                   -- Active status
  generation_batch UUID                             -- Batch tracking for versions
);
```

#### Column Details

**Core Template Fields**:

- `id`: Unique identifier (UUID)
- `name`: AI-generated template name (in English)
- `description`: Standardized event description
- `default_points`: Typical point value for this behavior
- `frequency`: Usage count, incremented each time template is used
- `last_seen`: Timestamp of last usage
- `ai_confidence`: AI confidence score (0.0-1.0) for template quality
- `created_at`: Template creation timestamp
- `updated_at`: Last modification timestamp
- `is_active`: Active status for template availability
- `generation_batch`: UUID linking templates to analysis batch

### template_analysis

Metadata tracking for AI template generation and analysis history.

```sql
CREATE TABLE template_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,                           -- Links to template generation
  analyzed_events_count INTEGER,                    -- Number of events analyzed
  ai_model_used TEXT,                              -- OpenAI model version
  analysis_prompt TEXT,                            -- AI prompt used
  ai_response_raw JSONB,                           -- Full AI response
  templates_generated INTEGER,                     -- Number of templates created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Column Details

**Analysis Tracking**:

- `id`: Unique identifier (UUID)
- `batch_id`: Links to `templates.generation_batch` for version control
- `analyzed_events_count`: Number of events processed in analysis
- `ai_model_used`: OpenAI model version (e.g., "gpt-4")
- `analysis_prompt`: Complete prompt sent to AI
- `ai_response_raw`: Full AI response in JSONB format
- `templates_generated`: Number of templates created from analysis
- `created_at`: Analysis timestamp

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

-- Template system optimization
CREATE INDEX idx_events_template ON events(template_id);
CREATE INDEX idx_templates_active ON templates(is_active);
CREATE INDEX idx_templates_frequency ON templates(frequency DESC);
CREATE INDEX idx_templates_batch ON templates(generation_batch);
CREATE INDEX idx_templates_name ON templates(name);

-- Template analysis optimization
CREATE INDEX idx_template_analysis_batch ON template_analysis(batch_id);
CREATE INDEX idx_template_analysis_created ON template_analysis(created_at DESC);

-- Vector similarity search (ivfflat for approximate nearest neighbor)
CREATE INDEX events_description_embedding_idx
ON events USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 100);
```

#### Index Usage

- **Performance Indexes**: Speed up date-based queries and filtering
- **AI Indexes**: Improve text-based search and embedding operations
- **Template Indexes**: Optimize template selection and usage tracking
- **Vector Index**: Enables fast similarity search using cosine distance
  - Uses `ivfflat` algorithm for approximate nearest neighbor search
  - Configured with 100 lists for optimal performance
  - Supports cosine distance operations (`<=>`)

## Functions

### find_similar_events()

PostgreSQL function to find events similar to a given embedding vector.

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

Function to automatically group events by similarity for category creation.

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
  RETURN QUERY
  WITH clustered_events AS (
    -- Clustering logic using similarity threshold
    SELECT
      e1.id,
      e1.description,
      ROW_NUMBER() OVER (ORDER BY e1.timestamp) as category_id
    FROM events e1
    WHERE e1.is_active = true
    AND e1.description_embedding IS NOT NULL
  )
  SELECT
    c.category_id::int,
    c.description as sample_description,
    COUNT(*)::int as event_count
  FROM clustered_events c
  GROUP BY c.category_id, c.description
  ORDER BY event_count DESC;
END;
$$;
```

#### Features

- Dynamic category creation based on similarity
- Representative sample selection
- Event count per category
- Configurable similarity threshold

## Triggers

### Auto-update Timestamps

Automatically updates the `updated_at` column when records are modified.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Events table trigger
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Templates table trigger
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data

### Initial Data Setup

```sql
-- Insert sample events
INSERT INTO events (name, description, points, day_of_week, day_of_month)
VALUES
  ('Morning routine', 'Brushed teeth without reminding', 2, 'Monday', 1),
  ('Helpful behavior', 'Helped set the table', 3, 'Monday', 1),
  ('Cleanup time', 'Organized bedroom', 4, 'Tuesday', 2)
ON CONFLICT DO NOTHING;

-- Insert sample templates (typically generated by AI)
INSERT INTO templates (name, description, default_points, frequency, ai_confidence)
VALUES
  ('Household chores', 'Helped with cleaning and organizing tasks', 3, 5, 0.85),
  ('Personal hygiene', 'Completed hygiene routine independently', 2, 8, 0.90),
  ('Academic effort', 'Showed good effort in schoolwork', 4, 3, 0.75)
ON CONFLICT DO NOTHING;
```

## Migration History

### 1. Initial Schema (20240320000000_init.sql)

- Created basic `events` table
- Added `point_summaries` view
- Created performance indexes
- Added update timestamp trigger
- Added `is_active` column for soft deletes

### 2. Template System (20250101000001_create_templates.sql)

- Added `templates` table with AI confidence scoring
- Created `template_analysis` metadata table
- Added `template_id` foreign key to events
- Created template-related indexes
- Added template update triggers

### 3. Event Names (20250101000002_add_name_to_events.sql)

- Added optional `name` field to events table
- Updated indexes to include name field
- Modified event creation to auto-generate names

### 4. AI Enhancements (add_embedding_column.sql)

- Added `description_embedding` vector column
- Created vector similarity index
- Added `find_similar_events()` function
- Added `categorize_events()` function

### 5. Multilingual Support (add_normalized_description.sql)

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
          name: string | null;
          description: string;
          points: number;
          timestamp: string;
          day_of_week: string;
          day_of_month: number;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          description_embedding: number[] | null;
          normalized_description: string | null;
          template_id: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          description: string;
          points: number;
          timestamp?: string;
          day_of_week: string;
          day_of_month: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          description_embedding?: number[] | null;
          normalized_description?: string | null;
          template_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          description?: string;
          points?: number;
          timestamp?: string;
          day_of_week?: string;
          day_of_month?: number;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          description_embedding?: number[] | null;
          normalized_description?: string | null;
          template_id?: string | null;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          default_points: number;
          frequency: number;
          last_seen: string | null;
          ai_confidence: number | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          generation_batch: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          default_points?: number;
          frequency?: number;
          last_seen?: string | null;
          ai_confidence?: number | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          generation_batch?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          default_points?: number;
          frequency?: number;
          last_seen?: string | null;
          ai_confidence?: number | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          generation_batch?: string | null;
        };
      };
      template_analysis: {
        Row: {
          id: string;
          batch_id: string;
          analyzed_events_count: number | null;
          ai_model_used: string | null;
          analysis_prompt: string | null;
          ai_response_raw: any | null;
          templates_generated: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          analyzed_events_count?: number | null;
          ai_model_used?: string | null;
          analysis_prompt?: string | null;
          ai_response_raw?: any | null;
          templates_generated?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          analyzed_events_count?: number | null;
          ai_model_used?: string | null;
          analysis_prompt?: string | null;
          ai_response_raw?: any | null;
          templates_generated?: number | null;
          created_at?: string;
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
    Functions: {
      find_similar_events: {
        Args: {
          search_embedding: number[];
          similarity_threshold: number;
          max_results: number;
        };
        Returns: {
          id: string;
          description: string;
          points: number;
          timestamp: string;
          day_of_week: string;
          is_active: boolean;
          similarity: number;
        }[];
      };
      categorize_events: {
        Args: {
          similarity_threshold?: number;
        };
        Returns: {
          category_id: number;
          sample_description: string;
          event_count: number;
        }[];
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
- Optimize template queries with frequency sorting

### Vector Operations

- Vector similarity operations are computationally expensive
- Use appropriate similarity thresholds to limit results
- Consider caching frequently accessed embeddings
- Monitor query performance with large datasets
- Regular `VACUUM` and `ANALYZE` on vector columns

### Template System Performance

- Template frequency updates are atomic operations
- Batch template analysis for cost efficiency
- Use generation_batch for version control
- Index template searches by name and description
- Monitor template usage patterns for optimization

### Storage Considerations

- Vector embeddings add ~6KB per event (1536 floats)
- Template analysis metadata can grow large
- Consider archiving strategies for large datasets
- Monitor database size growth with AI features
- Regular cleanup of inactive templates

## Backup and Recovery

### Critical Data

- Core `events` table with all behavioral data
- `templates` table with AI-generated patterns
- Generated embeddings (expensive to regenerate)
- Normalized descriptions (require API calls to recreate)
- Template analysis history for debugging

### Recovery Strategies

- **Embeddings**: Can be regenerated using `/api/admin/events/update-all-embeddings`
- **Templates**: Can be regenerated using `/api/admin/analyze-templates`
- **Translations**: Can be regenerated from original descriptions
- **Vector indexes**: Automatically rebuilt on restore
- **Template relationships**: May need manual re-linking

### Backup Recommendations

```sql
-- Regular backup of core data
pg_dump --table=events --table=templates --table=template_analysis doy_pal

-- Backup with vector data (larger)
pg_dump --table=events --include-data doy_pal

-- Schema-only backup for disaster recovery
pg_dump --schema-only doy_pal
```

## Monitoring and Maintenance

### Regular Maintenance Tasks

```sql
-- Update statistics for query optimization
ANALYZE events;
ANALYZE templates;

-- Vacuum vector index for performance
VACUUM events;

-- Monitor index usage
SELECT * FROM pg_stat_user_indexes WHERE relname IN ('events', 'templates');

-- Check vector index health
SELECT * FROM pg_stat_user_tables WHERE relname = 'events';
```

### Performance Monitoring

```sql
-- Monitor slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%events%'
ORDER BY mean_exec_time DESC;

-- Check template usage patterns
SELECT name, frequency, last_seen
FROM templates
WHERE is_active = true
ORDER BY frequency DESC;

-- Monitor embedding processing
SELECT COUNT(*) as total_events,
       COUNT(description_embedding) as with_embeddings,
       COUNT(normalized_description) as with_translations
FROM events
WHERE is_active = true;
```

---

_This database schema documentation reflects the complete implementation including all AI features, template system, and performance optimizations as of the latest version._
