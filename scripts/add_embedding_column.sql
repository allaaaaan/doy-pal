-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add a description_embedding column to the events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS description_embedding vector(1536);

-- Create an index for similarity searches
CREATE INDEX IF NOT EXISTS events_description_embedding_idx 
ON events USING ivfflat (description_embedding vector_cosine_ops) WITH (lists = 100);

-- Create a function to find similar events
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
  AND 1 - (e.description_embedding <=> search_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$;

-- Create a function to categorize events based on embedding similarity
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
  -- Create a temporary table to hold the categorization results
  CREATE TEMP TABLE IF NOT EXISTS temp_categories (
    category_id serial PRIMARY KEY,
    representative_id uuid,
    sample_description text,
    event_count int DEFAULT 1
  );
  
  -- Clear the temp table for fresh results
  TRUNCATE temp_categories;
  
  -- For each event with an embedding, find or create a category
  FOR event_row IN (
    SELECT id, description, description_embedding 
    FROM events 
    WHERE description_embedding IS NOT NULL
    AND is_active = true
    ORDER BY timestamp DESC
  )
  LOOP
    -- Try to find a matching category based on similarity
    DECLARE
      category_match record;
      match_found boolean := false;
    BEGIN
      FOR category_match IN (
        SELECT c.category_id, e.description_embedding
        FROM temp_categories c
        JOIN events e ON e.id = c.representative_id
      )
      LOOP
        IF 1 - (event_row.description_embedding <=> category_match.description_embedding) > similarity_threshold THEN
          -- Update the category count
          UPDATE temp_categories 
          SET event_count = event_count + 1
          WHERE category_id = category_match.category_id;
          
          match_found := true;
          EXIT;
        END IF;
      END LOOP;
      
      -- If no match found, create a new category
      IF NOT match_found THEN
        INSERT INTO temp_categories (representative_id, sample_description)
        VALUES (event_row.id, event_row.description);
      END IF;
    END;
  END LOOP;
  
  -- Return the categorization results
  RETURN QUERY
  SELECT 
    c.category_id,
    c.sample_description,
    c.event_count
  FROM temp_categories c
  ORDER BY c.event_count DESC;
END;
$$; 