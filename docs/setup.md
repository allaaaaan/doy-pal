# Setup Guide

This guide provides step-by-step instructions for setting up the Doy-Pal application, including all dependencies, environment configuration, database setup, AI features, and the complete template system.

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: For cloning the repository

### External Services

- **Supabase Account**: For database and backend services
- **OpenAI Account**: For AI features (embeddings, translation, template generation)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd doy-pal
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:

- Next.js 15.3.2 with React 19 and App Router
- Supabase client for database operations
- OpenAI SDK for AI features
- TypeScript and Tailwind CSS 4
- Heroicons for consistent iconography
- PWA support packages

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add the following environment variables:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_SECRET_KEY=your-supabase-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Optional: Development Configuration
NODE_ENV=development
```

### 4. Environment Variables Details

#### Supabase Configuration

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **Settings > API**
3. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Key** → `SUPABASE_SECRET_KEY` (not the anon key!)

#### OpenAI Configuration

1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to **API Keys**
3. Create a new secret key → `OPENAI_API_KEY`

**Required OpenAI Models Access**:

- `text-embedding-3-large` (for embeddings)
- `gpt-4` (for template generation and translations)

## Database Setup

### 1. Enable Required Extensions

First, enable these PostgreSQL extensions in your Supabase SQL editor:

```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Execute Migrations in Order

Run these SQL scripts in your Supabase SQL editor **in the following order**:

#### Step 1: Initial Schema

```sql
-- Execute: supabase/migrations/20240320000000_init.sql
-- This creates the basic events table and initial structure
```

#### Step 2: Template System

```sql
-- Execute: supabase/migrations/20250101000001_create_templates.sql
-- This adds templates table and template_analysis table
```

#### Step 3: Event Names

```sql
-- Execute: supabase/migrations/20250101000002_add_name_to_events.sql
-- This adds the name field to events table
```

#### Step 4: AI Enhancements

```sql
-- Execute: scripts/add_embedding_column.sql
-- This adds vector embeddings and similarity functions
```

#### Step 5: Multilingual Support

```sql
-- Execute: scripts/add_normalized_description.sql
-- This adds normalized_description for translations
```

### 3. Verify Database Setup

Check that all tables and functions are created:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables: events, templates, template_analysis

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- Expected functions: find_similar_events, categorize_events
```

### 4. Verify Complete Schema

Ensure your events table has all required columns:

```sql
-- Check events table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events' AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Expected columns**:

- `id`, `name`, `description`, `points`, `timestamp`, `day_of_week`, `day_of_month`
- `created_at`, `updated_at`, `is_active`
- `normalized_description`, `description_embedding`, `template_id`

**Check templates table**:

```sql
-- Check templates table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'templates' AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Expected columns**:

- `id`, `name`, `description`, `default_points`, `frequency`, `last_seen`
- `ai_confidence`, `created_at`, `updated_at`, `is_active`, `generation_batch`

## Development Server

### Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

### Development URLs

- **Main App**: [http://localhost:3000](http://localhost:3000)
- **Home Page**: [http://localhost:3000/home](http://localhost:3000/home)
- **Event Creation**: [http://localhost:3000/event](http://localhost:3000/event)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Template Management**: [http://localhost:3000/admin/templates](http://localhost:3000/admin/templates)
- **Link Management**: [http://localhost:3000/admin/link-events](http://localhost:3000/admin/link-events)
- **Embeddings**: [http://localhost:3000/admin/embeddings](http://localhost:3000/admin/embeddings)

## Initial Data and Testing

### 1. Create Sample Events

Add sample events through the application UI or via API:

```bash
# Create events with names
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning routine",
    "description": "Brushed teeth without reminding",
    "points": 2
  }'

curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Helpful behavior",
    "description": "Helped set the table for dinner",
    "points": 3
  }'
```

### 2. Generate AI Templates

Once you have some events, generate templates using the admin interface:

**Via Admin Interface**:

1. Navigate to [http://localhost:3000/admin/templates](http://localhost:3000/admin/templates)
2. Click "Analyze Latest Events"
3. Wait for AI analysis to complete
4. Review generated templates

**Via API**:

```bash
curl -X POST http://localhost:3000/api/admin/analyze-templates
```

### 3. Generate Embeddings

After adding events, generate embeddings for AI features:

```bash
curl -X POST http://localhost:3000/api/admin/events/update-all-embeddings
```

### 4. Test Template System

Test template functionality:

```bash
# List active templates
curl "http://localhost:3000/api/templates"

# Search templates
curl "http://localhost:3000/api/templates?search=help"

# Create event with template
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evening help",
    "description": "Helped with household chores",
    "points": 3,
    "template_id": "your-template-id"
  }'
```

### 5. Test AI Features

Test similarity search functionality:

```bash
# Find similar events
curl -X POST http://localhost:3000/api/admin/events/similar \
  -H "Content-Type: application/json" \
  -d '{
    "text": "helped with dinner",
    "threshold": 0.6,
    "limit": 5
  }'

# Get event categories
curl "http://localhost:3000/api/admin/events/categories?threshold=0.8"
```

### 6. Test Template Linking

Test event-template relationship management:

```bash
# Generate link suggestions
curl -X POST http://localhost:3000/api/admin/link-events-templates \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate_suggestions",
    "threshold": 0.7,
    "max_suggestions": 10
  }'
```

## Complete Feature Testing

### 1. Template Workflow

Test the complete template system:

1. **Create Events**: Add 5-10 diverse behavioral events
2. **Generate Templates**: Use admin interface to analyze events
3. **Review Templates**: Check AI confidence scores and descriptions
4. **Use Templates**: Create new events using generated templates
5. **Monitor Usage**: Check template frequency updates

### 2. AI Feature Testing

Test all AI capabilities:

1. **Embeddings**: Generate embeddings for all events
2. **Similarity Search**: Find similar events across languages
3. **Translation**: Test with non-English descriptions
4. **Categorization**: Group events by similarity
5. **Cross-Language**: Verify multilingual support

### 3. Admin Interface Testing

Test all admin features:

1. **Template Management**: Create, update, activate/deactivate templates
2. **Event Analytics**: View event statistics and patterns
3. **Link Management**: Generate and apply event-template links
4. **Embedding Tools**: Process embeddings and test similarity
5. **Batch Operations**: Test bulk processing capabilities

### 4. Mobile UI Testing

Test mobile-specific features:

1. **Responsive Design**: Test on different screen sizes
2. **Touch Interactions**: Verify touch targets and gestures
3. **PWA Features**: Test app installation and offline mode
4. **Dark Mode**: Toggle between light and dark themes
5. **Navigation**: Test mobile navigation and safe areas

## Configuration Options

### AI Settings

Adjust AI parameters in your environment or code:

```typescript
// AI configuration options
const aiConfig = {
  similarity_threshold: 0.7, // Default similarity threshold
  batch_size: 3, // Embedding batch size
  batch_delay: 2000, // Delay between batches (ms)
  max_templates: 15, // Maximum templates per analysis
  confidence_threshold: 0.6, // Minimum AI confidence
  embedding_model: "text-embedding-3-large",
  translation_model: "gpt-4",
};
```

### Template System Settings

Configure template behavior:

```typescript
// Template system configuration
const templateConfig = {
  auto_generate: false, // Manual generation only
  max_analysis_events: 100, // Events to analyze
  min_confidence: 0.5, // Minimum confidence to keep
  version_control: true, // Keep template history
  usage_tracking: true, // Track template usage
};
```

### Mobile UI Customization

Adjust mobile UI settings:

```typescript
// Mobile UI configuration
const mobileConfig = {
  touch_target_size: 44, // Minimum touch target (px)
  safe_area_padding: 16, // Safe area padding (px)
  animation_duration: 200, // Transition duration (ms)
  swipe_threshold: 50, // Swipe gesture threshold (px)
  dark_mode_preference: "system", // Dark mode setting
};
```

## Performance Optimization

### Database Optimization

Configure database for optimal performance:

```sql
-- Optimize vector index for larger datasets
DROP INDEX IF EXISTS events_description_embedding_idx;
CREATE INDEX events_description_embedding_idx
ON events USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 200); -- Increase for larger datasets

-- Optimize template searches
CREATE INDEX IF NOT EXISTS templates_search_idx
ON templates USING gin(to_tsvector('english', name || ' ' || description));

-- Optimize frequency sorting
CREATE INDEX IF NOT EXISTS templates_popularity_idx
ON templates (is_active, frequency DESC, last_seen DESC);
```

### API Rate Limiting

Configure OpenAI API usage:

```typescript
// Adjust processing settings
const processingConfig = {
  embedding_batch_size: 3, // Events per batch
  embedding_delay: 2000, // Delay between batches
  max_concurrent_requests: 3, // Concurrent API calls
  retry_attempts: 3, // Retry failed requests
  timeout: 30000, // Request timeout (ms)
};
```

## Troubleshooting

### Common Setup Issues

#### Environment Variables Not Loading

```bash
# Check environment variables
echo $SUPABASE_URL
echo $OPENAI_API_KEY

# Restart development server
npm run dev
```

#### Database Connection Issues

```bash
# Test Supabase connection
curl -H "apikey: YOUR_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/events"
```

#### OpenAI API Errors

```javascript
// Test OpenAI connection
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello" }],
});
```

#### Vector Extension Issues

If pgvector is not available:

1. Go to Supabase Dashboard → Database → Extensions
2. Search for "vector" and enable it
3. Re-run embedding migration scripts

### Feature-Specific Issues

#### Templates Not Generating

```bash
# Check event data
curl "http://localhost:3000/api/events?limit=5"

# Verify OpenAI API key
curl "http://localhost:3000/api/admin/analyze-templates"
```

#### Embeddings Not Processing

```bash
# Check events without embeddings
curl "http://localhost:3000/api/admin/events/update-all-embeddings"

# Monitor processing
tail -f logs/embedding-processing.log
```

#### Template Linking Issues

```bash
# Check unlinked events
curl "http://localhost:3000/api/admin/link-events-templates" \
  -H "Content-Type: application/json" \
  -d '{"action": "get_stats"}'
```

#### Mobile UI Issues

Common mobile display problems:

- **Safe Area**: Ensure `env(safe-area-inset-*)` CSS is applied
- **Touch Targets**: Verify minimum 44px touch target size
- **Dark Mode**: Check system preference detection
- **PWA**: Verify manifest.json and service worker

### Database Issues

#### Missing Functions

```sql
-- Check if functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- If missing, re-run migration scripts
```

#### Performance Issues

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public';

-- Analyze table statistics
ANALYZE events;
ANALYZE templates;
```

#### Vector Index Issues

```sql
-- Rebuild vector index
DROP INDEX IF EXISTS events_description_embedding_idx;
CREATE INDEX events_description_embedding_idx
ON events USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 100);
```

## Development Tips

### Debugging AI Features

```javascript
// Enable debug logging
const debugAI = {
  log_translations: true,
  log_embeddings: true,
  log_similarity_scores: true,
  log_template_analysis: true,
};

// Test individual AI components
const testTranslation = async () => {
  const result = await translateToEnglish("ayudó con la cena");
  console.log("Translation result:", result);
};
```

### Template Development

```javascript
// Test template generation
const testTemplateGeneration = async () => {
  const events = await fetch("/api/events?limit=10").then((r) => r.json());
  console.log("Events for analysis:", events);

  const templates = await fetch("/api/admin/analyze-templates", {
    method: "POST",
  }).then((r) => r.json());
  console.log("Generated templates:", templates);
};
```

### Mobile Testing

```javascript
// Test mobile features
const testMobileFeatures = () => {
  // Test touch events
  document.addEventListener("touchstart", (e) =>
    console.log("Touch start:", e)
  );

  // Test PWA installation
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("PWA install prompt:", e);
  });

  // Test service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
};
```

## Production Deployment

### Pre-deployment Checklist

1. **Environment Variables**: All required variables configured
2. **Database**: All migrations applied in production
3. **AI Services**: OpenAI API key and quotas verified
4. **PWA**: Service worker and manifest configured
5. **Performance**: Indexes optimized for production load

### Deployment Steps

1. **Build Application**:

   ```bash
   npm run build
   ```

2. **Deploy to Hosting Platform** (Vercel, Netlify, etc.):

   ```bash
   # Configure environment variables in platform
   # Deploy built application
   ```

3. **Configure Production Database**:

   ```sql
   -- Run all migrations in production Supabase
   -- Verify all tables, functions, and indexes
   ```

4. **Test Production Features**:

   ```bash
   # Test all API endpoints
   # Verify AI features work
   # Check mobile UI on devices
   ```

5. **Monitor and Optimize**:
   ```bash
   # Monitor OpenAI API usage
   # Check database performance
   # Track user engagement
   ```

### Post-deployment Tasks

1. **Create Initial Templates**: Run AI analysis on production data
2. **Generate Embeddings**: Process all events for AI features
3. **Monitor Performance**: Set up monitoring and alerts
4. **User Onboarding**: Create initial user guidance
5. **Analytics**: Track feature usage and effectiveness

## Maintenance

### Regular Tasks

- **Weekly**: Monitor AI API usage and costs
- **Monthly**: Review template effectiveness and update
- **Quarterly**: Analyze user behavior and optimize features
- **As needed**: Update dependencies and security patches

### Monitoring

```bash
# Monitor API usage
curl "https://api.openai.com/v1/usage" \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check database performance
psql -h localhost -p 5432 -U postgres -c "SELECT * FROM pg_stat_activity;"

# Monitor application performance
npm run build:analyze
```

---

_This setup guide covers the complete installation and configuration process for all features including AI templates, embeddings, admin interface, and mobile UI. Follow all steps carefully to ensure proper system operation._

**Last Updated**: January 2025 - Reflects the latest system with complete AI-powered features and admin interface.
