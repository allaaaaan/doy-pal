# AI-Powered Template System Design

## Overview

Build an intelligent template system that analyzes existing event data using AI to automatically generate templates for quick event creation. Templates are derived from actual usage patterns rather than static categories.

## Database Schema

### Templates Table

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- AI-generated template name
  description TEXT NOT NULL,             -- Template description for events
  default_points INTEGER NOT NULL DEFAULT 1,
  frequency INTEGER DEFAULT 0,          -- How often this pattern appears
  last_seen TIMESTAMP WITH TIME ZONE,   -- When this pattern was last used
  ai_confidence DECIMAL(3,2),           -- AI confidence score (0.00-1.00)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  generation_batch UUID                 -- Track which AI analysis created this
);

-- Indexes
CREATE INDEX idx_templates_active ON templates (is_active);
CREATE INDEX idx_templates_frequency ON templates (frequency DESC);
CREATE INDEX idx_templates_batch ON templates (generation_batch);
```

### Template Analysis Metadata

```sql
CREATE TABLE template_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL,
  analyzed_events_count INTEGER,
  ai_model_used TEXT,
  analysis_prompt TEXT,
  ai_response_raw JSONB,
  templates_generated INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## AI Analysis API Design

### Endpoint: POST /api/admin/analyze-templates

**Input:** None (analyzes latest 100 events)

**Process:**

1. Fetch latest 100 active events
2. Send to OpenAI for analysis
3. Parse AI response into template objects
4. Update templates table
5. Return analysis results

**AI Prompt Strategy:**

```
Analyze these child behavior tracking events and identify common patterns.
For each pattern, provide:
- A clear template name
- A standardized description
- Typical point value
- How frequently this pattern appears

Events: [event data]

Return JSON with templates array.
```

## Implementation Plan

### 1. Database Migration

Create templates and template_analysis tables

### 2. AI Analysis Service

- OpenAI integration for pattern analysis
- Prompt engineering for optimal results
- Response parsing and validation

### 3. Admin API

- Template analysis endpoint
- Template management CRUD
- Batch tracking and history

### 4. Admin UI

- "Analyze Templates" button
- Analysis history and results
- Template management interface

### 5. Event Creation Integration

- Load active templates
- Template selection UI
- Auto-populate with modification support

## Template Update Strategy

### Option A: Version Control (Recommended)

- Keep historical templates with is_active flag
- Deactivate old templates when generating new ones
- Allows rollback and comparison

### Option B: Replace Strategy

- Delete old templates completely
- Replace with new analysis results
- Simpler but loses history

**Recommendation: Use Option A for better data governance**

## AI Analysis Workflow

```
1. Admin triggers analysis
2. Fetch latest 100 events
3. Group similar events
4. Send to OpenAI with structured prompt
5. Parse AI response
6. Validate template data
7. Deactivate old templates
8. Insert new templates with new batch_id
9. Log analysis metadata
10. Return results to admin
```

## Template Usage Analytics

Track template usage for continuous improvement:

- Which templates are used most
- Which templates are modified after selection
- Success rate of template suggestions

## Cost Optimization

- Manual trigger only (no automatic analysis)
- Batch processing (100 events at once)
- Cache analysis results
- Rate limiting on admin endpoint
- Option to analyze specific date ranges

## Future Enhancements

1. **Smart Scheduling**: Suggest optimal times to re-analyze
2. **Pattern Evolution**: Track how patterns change over time
3. **Personalization**: Templates specific to different children
4. **Confidence Scoring**: Show AI confidence in template suggestions
5. **User Feedback**: Allow rating of template quality
