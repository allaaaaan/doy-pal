-- Function to find similar events based on embedding similarity
-- It will use normalized_description for displaying results when available
CREATE OR REPLACE FUNCTION find_similar_events(
  search_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  max_results int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  description text,
  normalized_description text,
  similarity float,
  points integer,
  timestamp timestamptz,
  day_of_week text,
  day_of_month integer,
  created_at timestamptz,
  updated_at timestamptz,
  is_active boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.description,
    e.normalized_description,
    (e.description_embedding <=> search_embedding) AS similarity,
    e.points,
    e.timestamp,
    e.day_of_week,
    e.day_of_month,
    e.created_at,
    e.updated_at,
    e.is_active
  FROM
    events e
  WHERE
    e.description_embedding IS NOT NULL
    AND e.description_embedding <=> search_embedding < similarity_threshold
  ORDER BY
    similarity ASC
  LIMIT max_results;
END;
$$; 