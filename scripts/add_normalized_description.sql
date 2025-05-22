-- Add normalized_description column to events table
ALTER TABLE events ADD COLUMN normalized_description TEXT;

-- Comment on the new column
COMMENT ON COLUMN events.normalized_description IS 'English translation of description for consistent embedding generation';

-- Create an index on the normalized_description column for better query performance
CREATE INDEX idx_events_normalized_description ON events(normalized_description); 