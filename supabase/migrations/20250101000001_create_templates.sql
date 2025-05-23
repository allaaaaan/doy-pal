-- Create templates table for AI-generated event templates
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  default_points INTEGER NOT NULL DEFAULT 1,
  frequency INTEGER DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE,
  ai_confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  generation_batch UUID
);

-- Create template analysis metadata table
CREATE TABLE IF NOT EXISTS template_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  analyzed_events_count INTEGER,
  ai_model_used TEXT,
  analysis_prompt TEXT,
  ai_response_raw JSONB,
  templates_generated INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for templates
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates (is_active);
CREATE INDEX IF NOT EXISTS idx_templates_frequency ON templates (frequency DESC);
CREATE INDEX IF NOT EXISTS idx_templates_batch ON templates (generation_batch);
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates (name);

-- Add indexes for template_analysis
CREATE INDEX IF NOT EXISTS idx_template_analysis_batch ON template_analysis (batch_id);
CREATE INDEX IF NOT EXISTS idx_template_analysis_created ON template_analysis (created_at DESC);

-- Add template_id to events table for tracking which template was used
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES templates(id);

-- Add index for template lookups on events
CREATE INDEX IF NOT EXISTS idx_events_template ON events (template_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for templates table
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 