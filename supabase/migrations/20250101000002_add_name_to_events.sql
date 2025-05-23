-- Add name column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add index for name searches
CREATE INDEX IF NOT EXISTS idx_events_name ON events (name);

-- Update existing events with a default name based on description
-- This will help with the initial data migration
UPDATE events 
SET name = CASE 
  WHEN LENGTH(description) <= 50 THEN description
  ELSE LEFT(description, 47) || '...'
END
WHERE name IS NULL;

-- Add a comment to document the column
COMMENT ON COLUMN events.name IS 'Short, readable name/title for the event. Auto-generated from description if not provided.'; 