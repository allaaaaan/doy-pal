-- Add Profiles System Migration
-- Step 1: Create profiles table and add profile_id to all entities

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Add profile_id to all entities
ALTER TABLE events ADD COLUMN profile_id UUID REFERENCES profiles(id);
ALTER TABLE redemptions ADD COLUMN profile_id UUID REFERENCES profiles(id);
ALTER TABLE templates ADD COLUMN profile_id UUID REFERENCES profiles(id);
ALTER TABLE rewards ADD COLUMN profile_id UUID REFERENCES profiles(id);
ALTER TABLE template_analysis ADD COLUMN profile_id UUID REFERENCES profiles(id);

-- Add indexes for performance
CREATE INDEX idx_events_profile ON events(profile_id);
CREATE INDEX idx_redemptions_profile ON redemptions(profile_id);
CREATE INDEX idx_templates_profile ON templates(profile_id);
CREATE INDEX idx_rewards_profile ON rewards(profile_id);
CREATE INDEX idx_template_analysis_profile ON template_analysis(profile_id);

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update point_summaries view to be profile-specific
DROP VIEW IF EXISTS point_summaries;
CREATE OR REPLACE VIEW point_summaries AS
SELECT
  profile_id,
  SUM(points) AS total_points,
  SUM(CASE WHEN timestamp >= DATE_TRUNC('week', CURRENT_TIMESTAMP) THEN points ELSE 0 END) AS weekly_points,
  SUM(CASE WHEN timestamp >= DATE_TRUNC('month', CURRENT_TIMESTAMP) THEN points ELSE 0 END) AS monthly_points
FROM events
WHERE is_active = true AND profile_id IS NOT NULL
GROUP BY profile_id; 