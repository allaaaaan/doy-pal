-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points > 0),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  day_of_week TEXT NOT NULL,
  day_of_month INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create point_summaries view
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
FROM events;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_day_of_week ON events(day_of_week);
CREATE INDEX IF NOT EXISTS idx_events_day_of_month ON events(day_of_month);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO events (description, points, day_of_week, day_of_month) 
VALUES 
  ('Helped set the table', 2, 'Monday', 1),
  ('Brushed teeth without reminding', 1, 'Monday', 1)
ON CONFLICT DO NOTHING; 