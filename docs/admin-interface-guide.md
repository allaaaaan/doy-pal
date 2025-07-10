# Admin Interface Guide

This guide provides complete documentation for Doy-Pal's administrative interface, covering all admin pages, features, and management capabilities.

## Overview

The admin interface provides powerful tools for managing the AI-powered behavioral tracking system, including template management, event analytics, embedding processing, and event-template linking. All admin pages are accessible through a unified navigation system.

## Navigation Structure

### Base URL: `/admin`

### Admin Menu Layout

```typescript
// app/admin/layout.tsx
<nav className="flex space-x-4">
  <Link href="/admin">Events</Link>
  <Link href="/admin/templates">Templates</Link>
  <Link href="/admin/link-events">Link Events</Link>
  <Link href="/admin/embeddings">Embeddings</Link>
  <Link href="/">Back to App</Link>
</nav>
```

## 1. Events Management (`/admin`)

### Purpose

Central dashboard for event management and analytics.

### Features

- **Event Overview**: Summary of all events with filters
- **Bulk Operations**: Mass editing and processing capabilities
- **Analytics Dashboard**: Event statistics and patterns
- **Export Functionality**: Data export for analysis

### Key Metrics Displayed

```typescript
interface EventMetrics {
  total_events: number;
  active_events: number;
  events_with_templates: number;
  events_with_embeddings: number;
  recent_activity: Event[];
}
```

### Actions Available

- View all events with pagination
- Filter by date range, points, templates
- Export event data
- Bulk update operations
- Delete/archive events

## 2. Template Management (`/admin/templates`)

### Purpose

Comprehensive template creation and management system with both AI-powered and manual capabilities.

### Main Interface

#### Header Section

```typescript
// Primary controls with create button
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
  <h1>AI Template Management</h1>
  <div className="flex flex-col sm:flex-row gap-2">
    <button onClick={() => setShowCreateForm(true)}>
      <PlusIcon className="h-5 w-5 mr-2" />
      Create Template
    </button>
    <button onClick={analyzeTemplates} disabled={analyzing}>
      {analyzing ? "Analyzing..." : "Analyze Latest Events"}
    </button>
  </div>
</div>

// Updated status indicators
<div className="text-sm text-gray-600 dark:text-gray-400">
  Current templates: {templates.length} | Mix of AI-generated and manually created templates
</div>
```

#### Manual Template Creation

**Create Template Form**:

```typescript
// Inline form for creating new templates
const TemplateForm = () => (
  <form onSubmit={handleCreateTemplate} className="space-y-4">
    <div>
      <label>Template Name</label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Household chores"
        required
      />
    </div>

    <div>
      <label>Description</label>
      <textarea
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        rows={3}
        placeholder="e.g., Helped with cleaning and organizing tasks"
        required
      />
    </div>

    <div>
      <label>Default Points</label>
      <input
        type="number"
        min="1"
        max="100"
        value={formData.default_points}
        onChange={(e) =>
          setFormData({ ...formData, default_points: parseInt(e.target.value) })
        }
        required
      />
    </div>

    <div>
      <label>AI Confidence (Optional)</label>
      <input
        type="number"
        min="0"
        max="1"
        step="0.01"
        value={formData.ai_confidence || ""}
        onChange={(e) =>
          setFormData({
            ...formData,
            ai_confidence: e.target.value
              ? parseFloat(e.target.value)
              : undefined,
          })
        }
        placeholder="0.0 - 1.0"
      />
      <p className="text-sm text-gray-500 mt-1">
        Leave blank for manually created templates
      </p>
    </div>

    <div className="flex justify-end space-x-3">
      <button type="button" onClick={cancelEdit}>
        Cancel
      </button>
      <button type="submit" disabled={formLoading}>
        {formLoading ? "Creating..." : "Create Template"}
      </button>
    </div>
  </form>
);
```

**Features**:

- **Template Name**: Required field with validation
- **Description**: Multi-line textarea for detailed description
- **Default Points**: Number input (1-100 range)
- **AI Confidence**: Optional field for manual confidence scoring
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: Detailed error messages for failed operations

#### Template Editing

**Edit Template Modal**:

```typescript
// Modal dialog for editing existing templates
{
  editingTemplate && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Edit Template
          </h2>
          <button onClick={cancelEdit}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <TemplateForm isEditing={true} />
      </div>
    </div>
  );
}
```

**Edit Functionality**:

- **Inline Editing**: Click edit button to open modal
- **Pre-populated Fields**: Form auto-fills with existing template data
- **Real-time Updates**: Changes reflected immediately in template list
- **Validation**: Same validation rules as creation
- **Cancel Option**: Ability to cancel changes and revert

#### AI Template Analysis Process

```typescript
const analyzeTemplates = async () => {
  // 1. Fetch latest 100 events
  // 2. Send to OpenAI GPT-4 for pattern analysis
  // 3. Generate 5-15 templates with confidence scores
  // 4. Deactivate old templates (version control)
  // 5. Insert new templates with batch tracking
  // 6. Display results and refresh template list
};
```

#### Enhanced Template Management Table

**Updated Columns**:

- **Template**: Name and description with truncation
- **Points**: Default point value with colored badge
- **Usage**: Frequency count ("X times")
- **AI Confidence**: Enhanced with manual template indicator
  - 🟢 Green: 80%+ (high confidence)
  - 🟡 Yellow: 60-79% (medium confidence)
  - 🔴 Red: <60% (low confidence)
  - 🔘 Gray: "Manual" (manually created templates)
- **Last Used**: Date of last usage
- **Actions**: Expanded action buttons

**Action Buttons**:

```typescript
// Enhanced action column with multiple operations
<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
  <button onClick={() => startEdit(template)}>
    <PencilIcon className="h-4 w-4" />
  </button>
  <button onClick={() => toggleTemplate(template.id, template.is_active)}>
    {template.is_active ? "Deactivate" : "Activate"}
  </button>
  <button onClick={() => deleteTemplate(template.id)}>
    <TrashIcon className="h-4 w-4" />
  </button>
</td>
```

#### Template Status Indicators

**AI Confidence Display**:

```typescript
// Enhanced confidence indicators
{
  template.ai_confidence ? (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        template.ai_confidence >= 0.8
          ? "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200"
          : template.ai_confidence >= 0.6
          ? "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
          : "bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200"
      }`}
    >
      {(template.ai_confidence * 100).toFixed(0)}%
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
      Manual
    </span>
  );
}
```

### Template Operations

#### Create New Templates

```typescript
// POST /api/templates
const createTemplate = async (templateData) => {
  const response = await fetch("/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Template Name",
      description: "Template description",
      default_points: 3,
      ai_confidence: null, // null for manual templates
    }),
  });
};
```

#### Edit Existing Templates

```typescript
// PATCH /api/templates/[id]
const updateTemplate = async (templateId, updates) => {
  const response = await fetch(`/api/templates/${templateId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: updates.name,
      description: updates.description,
      default_points: updates.default_points,
      ai_confidence: updates.ai_confidence,
    }),
  });
};
```

#### Delete Templates

```typescript
// DELETE /api/templates/[id]
const deleteTemplate = async (templateId) => {
  if (
    !confirm(
      "Are you sure you want to delete this template? This action cannot be undone."
    )
  ) {
    return;
  }

  const response = await fetch(`/api/templates/${templateId}`, {
    method: "DELETE",
  });
};
```

#### Toggle Template Status

```typescript
// PATCH /api/templates/[id]
const toggleTemplate = async (templateId, isActive) => {
  const response = await fetch(`/api/templates/${templateId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: !isActive }),
  });
};
```

#### Status Messages

```typescript
// Success message after analysis
{
  analysisResult && (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
      <p className="font-medium">Analysis Complete!</p>
      <p>{analysisResult.message}</p>
      <p className="text-sm">Batch ID: {analysisResult.batch_id}</p>
    </div>
  );
}

// Error handling
{
  error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  );
}
```

## 3. Event-Template Linking (`/admin/link-events`)

### Purpose

Manage relationships between events and templates with AI-powered suggestions.

### Interface Components

#### Statistics Overview

```typescript
const linkData = {
  unlinked_events: 25, // Events without templates
  available_templates: 12, // Active templates
  total_events: 150, // All events
  link_coverage: 83, // Percentage of linked events
};
```

#### AI Suggestion Generation

```typescript
const generateSuggestions = async () => {
  // 1. Analyze unlinked events
  // 2. Find similar templates using embeddings
  // 3. Generate confidence scores
  // 4. Present suggestions for review
  // 5. Allow batch application
};
```

#### Suggestion Display

```typescript
// Each suggestion shows:
const LinkSuggestion = {
  event_id: "uuid",
  event_description: "helped clean kitchen",
  template_id: "template-uuid",
  template_name: "Household chores",
  confidence: 0.85,
  similarity_score: 0.78,
  recommended: true,
};
```

### Operations Available

#### 1. Generate AI Suggestions

```typescript
<button onClick={generateSuggestions} disabled={generating}>
  {generating ? "Generating..." : "AI Suggestions"}
</button>
```

#### 2. Manual Template Selection

```typescript
// Dropdown for each unlinked event
<select onChange={(e) => handleTemplateSelect(eventId, e.target.value)}>
  <option value="">Select template...</option>
  {templates.map((template) => (
    <option key={template.id} value={template.id}>
      {template.name} ({template.frequency} uses)
    </option>
  ))}
</select>
```

#### 3. Batch Link Application

```typescript
const batchLinkEvents = async () => {
  const linksToApply = Object.entries(selectedLinks)
    .filter(([eventId, templateId]) => templateId && templateId !== "")
    .map(([eventId, templateId]) => ({
      event_id: eventId,
      template_id: templateId,
    }));

  const response = await fetch("/api/admin/link-events-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "batch_link", batch_link: linksToApply }),
  });
};
```

#### 4. Link Validation

```typescript
// Validate suggestions before application
const validateLinks = (suggestions) => {
  return suggestions.filter(
    (suggestion) =>
      suggestion.confidence > 0.6 && suggestion.similarity_score > 0.7
  );
};
```

## 4. Embeddings Management (`/admin/embeddings`)

### Purpose

Manage AI embeddings, similarity search, and vector operations.

### Interface Sections

#### 1. Similarity Search Testing

```typescript
const SimilaritySearch = {
  input: "Text to search for similar events",
  threshold: 0.6,        // Minimum similarity score
  limit: 10,             // Maximum results
  results: Event[]       // Similar events found
};
```

#### 2. Event Categorization

```typescript
const EventCategories = {
  threshold: 0.8, // Similarity threshold for grouping
  categories: [
    {
      category_id: 1,
      sample_description: "helped with meal preparation",
      event_count: 8,
    },
  ],
};
```

#### 3. Bulk Embedding Processing

```typescript
const BulkProcessor = {
  total_events: 150,
  events_needing_processing: 25,
  processing_status: "idle" | "processing" | "complete",
  results: {
    updated: 20,
    failed: 5,
    skipped: 0,
  },
};
```

### Operations Available

#### 1. Test Similarity Search

```typescript
const findSimilarEvents = async () => {
  const response = await fetch("/api/admin/events/similar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: searchText,
      threshold: threshold,
      limit: limit,
    }),
  });
};
```

#### 2. Generate Event Categories

```typescript
const loadCategories = async () => {
  const response = await fetch(
    `/api/admin/events/categories?threshold=${threshold}`
  );
  const data = await response.json();
  setCategories(data.categories);
};
```

#### 3. Bulk Process Embeddings

```typescript
const updateAllEmbeddings = async () => {
  const response = await fetch("/api/admin/events/update-all-embeddings", {
    method: "POST",
  });
  const result = await response.json();

  // Shows progress and results
  setBatchResult({
    updated: result.updated,
    total: result.total,
    message: result.message,
  });
};
```

## Admin Interface Features

### 1. Real-time Status Updates

```typescript
// Loading states for all operations
const [analyzing, setAnalyzing] = useState(false);
const [loading, setLoading] = useState(true);
const [processing, setProcessing] = useState(false);
const [formLoading, setFormLoading] = useState(false);

// Progress indicators
{
  analyzing && <div>Analyzing events...</div>;
}
{
  processing && <div>Processing embeddings...</div>;
}
{
  formLoading && <div>Saving template...</div>;
}
```

### 2. Error Handling

```typescript
// Comprehensive error display
{
  error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p className="font-medium">Error:</p>
      <p>{error}</p>
    </div>
  );
}

// Form-specific errors
{
  formError && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
      {formError}
    </div>
  );
}
```

### 3. Success Notifications

```typescript
// Success feedback for operations
{
  success && (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
      <p className="font-medium">Success!</p>
      <p>{success}</p>
    </div>
  );
}
```

### 4. Dark Mode Support

```typescript
// Consistent dark mode across all admin pages
className = "bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white";
```

## API Endpoints for Template Management

### Template CRUD Operations

```typescript
// Create template
POST /api/templates
{
  "name": "Template Name",
  "description": "Template description",
  "default_points": 3,
  "ai_confidence": null
}

// Get all templates
GET /api/templates

// Get single template
GET /api/templates/[id]

// Update template
PATCH /api/templates/[id]
{
  "name": "Updated Name",
  "description": "Updated description",
  "default_points": 5,
  "ai_confidence": 0.85,
  "is_active": true
}

// Delete template
DELETE /api/templates/[id]
```

### Validation Rules

```typescript
// Template validation
const validateTemplate = (template) => {
  const errors = [];

  if (!template.name || !template.name.trim()) {
    errors.push("Template name is required");
  }

  if (!template.description || !template.description.trim()) {
    errors.push("Template description is required");
  }

  if (template.default_points < 1 || template.default_points > 100) {
    errors.push("Default points must be between 1 and 100");
  }

  if (
    template.ai_confidence &&
    (template.ai_confidence < 0 || template.ai_confidence > 1)
  ) {
    errors.push("AI confidence must be between 0 and 1");
  }

  return errors;
};
```

## Best Practices for Admin Users

### 1. Template Management

- **Mixed Approach**: Use both AI analysis and manual creation for comprehensive coverage
- **Regular Analysis**: Run AI analysis after significant event additions
- **Quality Control**: Monitor AI confidence scores and edit low-confidence templates
- **Usage Monitoring**: Track template frequency and effectiveness
- **Batch Management**: Use batch IDs to track template versions

### 2. Manual Template Creation

- **Descriptive Names**: Use clear, descriptive template names
- **Consistent Descriptions**: Maintain standardized language across templates
- **Appropriate Points**: Match point values to behavior significance
- **Regular Updates**: Edit templates based on usage patterns and feedback

### 3. Template Editing

- **Incremental Updates**: Make small, focused changes rather than complete rewrites
- **Preserve Usage Data**: Consider impact on existing event-template relationships
- **Test Changes**: Verify templates work correctly after editing
- **Document Changes**: Keep track of what was changed and why

### 4. Event Linking

- **AI First**: Use AI suggestions as starting point for linking
- **Manual Review**: Validate suggestions before batch application
- **Threshold Tuning**: Adjust similarity thresholds based on results
- **Performance Monitoring**: Track link accuracy and user satisfaction

### 5. Embedding Management

- **Batch Processing**: Process embeddings during off-peak hours
- **Regular Updates**: Update embeddings when descriptions change
- **Performance Monitoring**: Monitor similarity search performance
- **Cost Management**: Track OpenAI API usage and optimize batch sizes

### 6. System Maintenance

- **Regular Backups**: Backup template and embedding data
- **Performance Monitoring**: Monitor database query performance
- **Cost Tracking**: Track AI API usage and costs
- **User Feedback**: Collect feedback on template and suggestion quality

## Security Considerations

### 1. Access Control

- Admin pages require appropriate authentication
- Role-based access for different admin functions
- Audit logging for admin actions

### 2. Data Protection

- Template creation and editing require confirmation
- Backup before bulk operations
- Rate limiting on AI API calls

### 3. API Security

- Admin endpoints use service-level authentication
- Input validation on all admin operations
- Error handling without exposing sensitive data

## Performance Optimization

### 1. Database Queries

```sql
-- Optimize admin queries with proper indexes
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_templates_frequency ON templates(frequency DESC);
CREATE INDEX idx_events_template ON events(template_id);
CREATE INDEX idx_templates_name ON templates(name);
```

### 2. Batch Operations

```typescript
// Process in batches to prevent timeouts
const BATCH_SIZE = 3;
const BATCH_DELAY = 2000; // 2 seconds between batches
```

### 3. Caching Strategy

```typescript
// Cache frequently accessed data
const cacheTemplates = () => {
  localStorage.setItem("admin_templates", JSON.stringify(templates));
};
```

## Troubleshooting Guide

### Common Issues

#### 1. Template Creation/Editing Fails

```typescript
// Check form validation
const validateForm = () => {
  if (!formData.name.trim()) return "Template name is required";
  if (!formData.description.trim()) return "Template description is required";
  if (formData.default_points < 1 || formData.default_points > 100) {
    return "Default points must be between 1 and 100";
  }
  return null;
};
```

#### 2. Template Analysis Fails

```typescript
// Check OpenAI API key and quota
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Set" : "Missing");

// Verify event data
const { data: events } = await supabase
  .from("events")
  .select("id, description, normalized_description")
  .limit(5);
console.log("Sample events:", events);
```

#### 3. Template Deletion Issues

```typescript
// Check for dependent events
const checkDependencies = async (templateId) => {
  const { data: events } = await supabase
    .from("events")
    .select("id")
    .eq("template_id", templateId);

  if (events && events.length > 0) {
    console.log(`Template has ${events.length} linked events`);
  }
};
```

#### 4. Form Submission Problems

```typescript
// Debug form submission
const debugFormSubmission = (formData) => {
  console.log("Form data:", formData);
  console.log("Validation errors:", validateForm());
  console.log(
    "API endpoint:",
    `/api/templates${editingTemplate ? `/${editingTemplate.id}` : ""}`
  );
};
```

---

_This admin interface guide now covers the complete administrative features including manual template creation, editing, and comprehensive template management alongside AI-powered features and provides guidance for system management and maintenance._
