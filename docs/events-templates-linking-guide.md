# Events-Templates Linking Guide

This guide explains how events and templates are connected in Doy-Pal, including the linking system, usage tracking, and admin management capabilities.

## Overview

The events-templates linking system creates relationships between behavioral events and reusable templates, enabling:

- **Template Usage Tracking**: Monitor which templates are most popular
- **Event Categorization**: Group events by template patterns
- **Admin Analytics**: Understand user behavior and template effectiveness
- **AI-Powered Suggestions**: Automatically suggest template-event connections

## Database Relationships

### Core Schema

```sql
-- Events table with template reference
CREATE TABLE events (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  template_id UUID REFERENCES templates(id),  -- Link to template
  -- ... other fields
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  default_points INTEGER NOT NULL,
  frequency INTEGER DEFAULT 0,           -- Usage count
  last_seen TIMESTAMP WITH TIME ZONE,    -- Last usage
  ai_confidence DECIMAL(3,2),           -- AI confidence score
  -- ... other fields
);

-- Indexes for performance
CREATE INDEX idx_events_template ON events (template_id);
CREATE INDEX idx_templates_frequency ON templates (frequency DESC);
```

### Relationship Types

**One-to-Many**: Each template can be used by multiple events
**Optional**: Events can exist without templates (manual entries)
**Tracked**: Every template usage updates statistics automatically

## Event Creation with Templates

### User Flow

```typescript
// 1. User selects template in TemplateSelector
const selectedTemplate = {
  id: "template-uuid",
  name: "Helped with chores",
  description: "Assisted with household tasks",
  default_points: 3,
};

// 2. Form auto-fills with template data
setName(selectedTemplate.name);
setDescription(selectedTemplate.description);
setPoints(selectedTemplate.default_points);

// 3. User submits event
const eventData = {
  name: "Helped with chores",
  description: "Assisted with household tasks",
  points: 3,
  template_id: "template-uuid", // Link established
};
```

### API Processing

```typescript
// POST /api/events - Event creation with template
export async function POST(request: NextRequest) {
  const eventData = await request.json();

  // 1. Process AI features
  const aiResult = await translateAndGenerateEmbedding(eventData.description);

  // 2. Update template usage statistics
  if (eventData.template_id) {
    const { data: template } = await supabase
      .from("templates")
      .select("frequency")
      .eq("id", eventData.template_id)
      .single();

    await supabase
      .from("templates")
      .update({
        last_seen: new Date().toISOString(),
        frequency: (template?.frequency || 0) + 1, // Increment usage
      })
      .eq("id", eventData.template_id);
  }

  // 3. Create event with template link
  const { data: event } = await supabase
    .from("events")
    .insert({
      ...eventData,
      normalized_description: aiResult.translatedText,
      description_embedding: aiResult.embedding,
    })
    .select(
      `
      *,
      templates (id, name, ai_confidence)  -- Include template info
    `
    )
    .single();

  return NextResponse.json(event);
}
```

## Template Usage Analytics

### Automatic Tracking

Every time a template is used:

```typescript
// Template statistics updated automatically
{
  frequency: frequency + 1,           // Increment usage count
  last_seen: new Date().toISOString(), // Update timestamp
  updated_at: new Date().toISOString()  // Update modified time
}
```

### Usage Metrics

**Frequency Ranking**: Templates sorted by usage count
**Recency Tracking**: When templates were last used
**Popularity Indicators**: Visual cues in admin interface
**Effectiveness Scores**: AI confidence vs actual usage correlation

## Admin Interface: Link Management

### Location: `/admin/link-events`

This admin page provides tools for managing event-template relationships:

### Features

#### 1. **Unlinked Events Overview**

```typescript
// Shows events without template_id
const unlinkData = {
  unlinked_events: 25, // Events without templates
  available_templates: 12, // Active templates
  total_events: 150, // All events
};
```

#### 2. **AI-Powered Link Suggestions**

```typescript
// Generate suggestions based on similarity
const suggestions = [
  {
    event_id: "event-uuid",
    event_description: "helped clean kitchen",
    template_id: "template-uuid",
    template_name: "Household chores",
    confidence: 0.85,
    similarity_score: 0.78,
  },
];
```

#### 3. **Manual Link Management**

- **Single Event Linking**: Connect one event to one template
- **Batch Linking**: Apply multiple suggestions at once
- **Link Validation**: Ensure template-event compatibility
- **Undo Capability**: Remove or change links

### API Endpoints

#### Generate Link Suggestions

```typescript
// POST /api/admin/link-events-templates
{
  "action": "generate_suggestions",
  "threshold": 0.7,  // Minimum similarity
  "max_suggestions": 50
}
```

#### Batch Link Events

```typescript
// POST /api/admin/link-events-templates
{
  "action": "batch_link",
  "batch_link": [
    { "event_id": "uuid1", "template_id": "template-uuid1" },
    { "event_id": "uuid2", "template_id": "template-uuid2" }
  ]
}
```

## Template Selection Process

### TemplateSelector Component

```typescript
// components/TemplateSelector.tsx

// 1. Load active templates sorted by frequency
const fetchTemplates = async () => {
  const response = await fetch("/api/templates");
  const data = await response.json();
  setTemplates(data.templates || []);
};

// 2. Display templates with usage indicators
{
  templates.map((template) => (
    <div key={template.id}>
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      <span>{template.default_points} pts</span>
      <span>{template.frequency} uses</span> // Usage indicator
    </div>
  ));
}

// 3. Handle template selection
const handleTemplateSelect = (template) => {
  onTemplateSelect(template); // Auto-fill form
  setSelectedTemplate(template);
};
```

### Search and Filtering

```typescript
// Filter templates by name/description
const filteredTemplates = templates.filter(
  (template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
);

// Sort by frequency (most popular first)
const sortedTemplates = filteredTemplates.sort(
  (a, b) => b.frequency - a.frequency
);
```

## AI-Powered Template Suggestions

### Similarity-Based Matching

```typescript
// Find templates similar to event description
const findSimilarTemplates = async (eventDescription) => {
  const { embedding } = await translateAndGenerateEmbedding(eventDescription);

  // Compare with template embeddings
  const similarTemplates = await supabase.rpc("find_similar_templates", {
    search_embedding: embedding,
    similarity_threshold: 0.7,
  });

  return similarTemplates;
};
```

### Auto-Link Suggestions

```typescript
// Admin interface: Generate link suggestions
const generateLinkSuggestions = async () => {
  // 1. Get unlinked events
  const unlinkedEvents = await getUnlinkedEvents();

  // 2. For each event, find similar templates
  const suggestions = [];
  for (const event of unlinkedEvents) {
    const similarTemplates = await findSimilarTemplates(event.description);
    if (similarTemplates.length > 0) {
      suggestions.push({
        event_id: event.id,
        template_id: similarTemplates[0].id,
        confidence: similarTemplates[0].similarity,
      });
    }
  }

  return suggestions;
};
```

## Event Retrieval with Template Data

### API Response Format

```typescript
// GET /api/events - Include template information
{
  "id": "event-uuid",
  "name": "Evening help",
  "description": "Helped set dinner table",
  "points": 3,
  "template_id": "template-uuid",
  "templates": {                    // Joined template data
    "id": "template-uuid",
    "name": "Household chores",
    "ai_confidence": 0.85
  },
  "timestamp": "2024-01-15T18:30:00Z"
}
```

### Template Indicator in UI

```typescript
// EventItem component shows template info
const EventItem = ({ event }) => (
  <div className="event-card">
    <h3>{event.name}</h3>
    <p>{event.description}</p>
    <span>{event.points} points</span>

    {/* Template indicator */}
    {event.templates && (
      <div className="template-indicator">
        <SparklesIcon className="h-4 w-4" />
        <span>Template: {event.templates.name}</span>
        <span className="confidence">
          {(event.templates.ai_confidence * 100).toFixed(0)}%
        </span>
      </div>
    )}
  </div>
);
```

## Performance Optimization

### Database Indexes

```sql
-- Optimize template lookups
CREATE INDEX idx_events_template ON events (template_id);
CREATE INDEX idx_templates_frequency ON templates (frequency DESC);
CREATE INDEX idx_templates_active ON templates (is_active);

-- Optimize similarity searches
CREATE INDEX events_description_embedding_idx
ON events USING ivfflat (description_embedding vector_cosine_ops);
```

### Query Optimization

```typescript
// Efficient template loading with usage stats
const loadTemplatesWithStats = async () => {
  const { data: templates } = await supabase
    .from("templates")
    .select(
      `
      *,
      events!inner(count)  -- Get usage count
    `
    )
    .eq("is_active", true)
    .order("frequency", { ascending: false });

  return templates;
};
```

## Analytics and Reporting

### Template Effectiveness

```typescript
// Measure template performance
const templateAnalytics = {
  usage_frequency: template.frequency,
  last_used: template.last_seen,
  ai_confidence: template.ai_confidence,
  user_modification_rate: calculateModificationRate(template.id),
  success_rate: calculateSuccessRate(template.id),
};
```

### Usage Patterns

```typescript
// Track how templates are used
const usagePatterns = {
  most_popular: getTopTemplates(10),
  recent_activity: getRecentTemplateUsage(7), // Last 7 days
  modification_frequency: getModificationStats(),
  abandonment_rate: getAbandonmentStats(),
};
```

## Best Practices

### Template Design

1. **Clear Naming**: Use descriptive template names
2. **Consistent Descriptions**: Maintain standardized language
3. **Appropriate Points**: Match point values to behavior significance
4. **Regular Updates**: Refresh templates based on usage patterns

### Event Linking

1. **Semantic Matching**: Use AI similarity for accurate links
2. **Manual Review**: Validate AI suggestions before batch application
3. **Flexible Linking**: Allow users to modify template-filled events
4. **Performance Monitoring**: Track link accuracy and effectiveness

### Admin Management

1. **Regular Analysis**: Run template analysis periodically
2. **Quality Control**: Monitor AI confidence scores
3. **Usage Optimization**: Deactivate unused templates
4. **Feedback Loop**: Use analytics to improve template quality

## Troubleshooting

### Common Issues

#### Templates Not Loading

```typescript
// Check template API response
const debugTemplates = async () => {
  const response = await fetch("/api/templates");
  const data = await response.json();
  console.log("Templates:", data);

  if (!data.templates || data.templates.length === 0) {
    console.log("No templates found - run AI analysis");
  }
};
```

#### Link Suggestions Not Working

```typescript
// Verify embedding data
const debugEmbeddings = async () => {
  const { data: events } = await supabase
    .from("events")
    .select("id, description, description_embedding")
    .is("template_id", null)
    .limit(5);

  console.log("Unlinked events with embeddings:", events);
};
```

#### Template Usage Not Updating

```typescript
// Check template update logic
const debugTemplateUsage = async (templateId) => {
  const { data: template } = await supabase
    .from("templates")
    .select("frequency, last_seen")
    .eq("id", templateId)
    .single();

  console.log("Template usage stats:", template);
};
```

---

_This linking guide covers the complete event-template relationship system including admin management, AI-powered suggestions, and usage analytics._
