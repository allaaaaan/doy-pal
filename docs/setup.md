# Setup Guide

This guide provides step-by-step instructions for setting up the Doy-Pal application, including all dependencies, environment configuration, database setup, and the latest template system.

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: For cloning the repository

### External Services

- **Supabase Account**: For database and backend services
- **OpenAI Account**: For AI features (embeddings and translation)

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

- Next.js 15.3.2
- React 19
- Supabase client
- TypeScript and Tailwind CSS 4
- Heroicons for consistent iconography

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
- `gpt-4o` (for translations)

## Database Setup

### 1. Execute Migrations in Order

Run these SQL scripts in your Supabase SQL editor in the following order:

```sql
-- 1. Initial schema
-- Execute: supabase/migrations/20240320000000_init.sql

-- 2. Create templates table
-- Execute: supabase/migrations/20250101000001_create_templates.sql

-- 3. Add name field to events
-- Execute: supabase/migrations/20250101000002_add_name_to_events.sql
```

### 2. Enable Required Extensions

Ensure these PostgreSQL extensions are enabled in Supabase:

```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Verify Database Setup

Check that all tables and functions are created:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```

Expected tables: `events`, `templates`
Expected views: `point_summaries`
Expected functions: `find_similar_events`, `categorize_events`

### 4. Verify Schema Columns

Ensure your events table has all required columns:

```sql
-- Check events table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'events' AND table_schema = 'public'
ORDER BY ordinal_position;
```

Expected columns:

- `id`, `name`, `description`, `points`, `timestamp`, `day_of_week`, `day_of_month`
- `created_at`, `updated_at`, `is_active`
- `normalized_description`, `description_embedding`, `template_id`

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

## Initial Data and Testing

### 1. Create Sample Templates

Add sample templates through the application or via API:

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Helped with chores",
    "description": "Helped with household chores like cleaning or organizing",
    "default_points": 3
  }'
```

### 2. Add Sample Events

You can add sample events through the application UI or via API:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evening Help",
    "description": "Helped set the table for dinner",
    "points": 2,
    "template_id": "your-template-id"
  }'
```

### 3. Generate Embeddings

After adding events, generate embeddings for AI features:

```bash
curl -X POST http://localhost:3000/api/admin/events/update-all-embeddings
```

### 4. Test Template System

Test template search functionality:

```bash
curl "http://localhost:3000/api/templates?search=help"
```

### 5. Test Similarity Search

Test the similarity search functionality:

```bash
curl -X POST http://localhost:3000/api/admin/events/similar \
  -H "Content-Type: application/json" \
  -d '{
    "text": "helped with dinner",
    "threshold": 0.6,
    "limit": 5
  }'
```

## Configuration Options

### Template System Settings

Adjust these values based on your needs:

- **Search Threshold**: Fuzzy matching sensitivity for template search
- **Auto-fill Behavior**: Whether templates should auto-populate all fields
- **Usage Tracking**: Frequency updates for popular templates

### Similarity Search Settings

Adjust these values in the API calls based on your needs:

- **Threshold**: 0.4-0.9 (lower = more results, higher = more precise)
- **Limit**: 1-50 (maximum results to return)
- **Batch Size**: 3 (for bulk embedding updates)

### Mobile UI Customization

The app includes mobile-first optimizations:

- **Safe Area Insets**: Automatic handling for devices with notches
- **Touch Targets**: Minimum 44px touch targets for accessibility
- **Swipe Gestures**: Configurable swipe thresholds
- **Loading States**: Skeleton screens and progress indicators

### Performance Tuning

#### Database Optimization

```sql
-- Adjust vector index parameters for larger datasets
DROP INDEX IF EXISTS events_description_embedding_idx;
CREATE INDEX events_description_embedding_idx
ON events USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 200); -- Increase lists for larger datasets

-- Index for template search
CREATE INDEX IF NOT EXISTS templates_name_search_idx
ON templates USING gin(to_tsvector('english', name));

-- Index for template frequency
CREATE INDEX IF NOT EXISTS templates_frequency_idx
ON templates (frequency DESC, last_seen DESC);
```

#### API Rate Limiting

Modify batch processing in `update-all-embeddings`:

- Adjust `batchSize` (currently 3)
- Modify delay between batches (currently 2000ms)

## Troubleshooting

### Common Issues

#### Environment Variables Not Loading

- Ensure `.env.local` is in the root directory
- Restart the development server after changing environment variables
- Check that variable names match exactly (case-sensitive)

#### Supabase Connection Issues

```bash
# Test connection
curl -H "apikey: YOUR_SERVICE_ROLE_KEY" \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/events"
```

#### OpenAI API Errors

- Verify API key is valid and has sufficient credits
- Check that required models are available in your OpenAI account
- Monitor rate limits (especially during bulk operations)

#### Vector Extension Issues

If pgvector is not available:

1. Go to Supabase Dashboard → Database → Extensions
2. Enable "vector" extension
3. Re-run the embedding migration script

#### Template System Issues

If templates aren't working:

```sql
-- Check templates table exists
SELECT * FROM templates LIMIT 1;

-- Check template API endpoint
curl "http://localhost:3000/api/templates"
```

#### Mobile UI Issues

Common mobile display problems:

- **Bottom Content Cut Off**: Ensure `mobile-safe-bottom` class is applied
- **Date/Time Pickers**: Check that custom styles are loading correctly
- **Touch Targets**: Verify buttons meet minimum size requirements

### Database Issues

#### Missing Functions

If database functions are missing:

```sql
-- Check function exists
SELECT * FROM pg_proc WHERE proname = 'find_similar_events';

-- If missing, re-run the migrations in order
```

#### Performance Issues

For large datasets:

1. Increase vector index lists parameter
2. Add composite indexes for common queries
3. Consider archiving old events
4. Optimize template search with proper indexing

### API Issues

#### 404 Errors on Template Endpoints

- Ensure template migrations have been run
- Check that template API routes exist in `app/api/templates/`
- Verify template table structure matches expected schema

#### 404 Errors on Admin Endpoints

- Ensure you're using POST for similarity search and bulk updates
- Check that the API routes exist in `app/api/admin/events/`

#### Rate Limiting from OpenAI

- Reduce batch size in bulk operations
- Increase delays between API calls
- Consider upgrading OpenAI plan for higher rate limits

## Security Considerations

### Environment Variables

- Never commit `.env.local` to version control
- Use different API keys for development and production
- Rotate API keys regularly

### Database Security

- Use service role key only for server-side operations
- Implement proper Row Level Security (RLS) policies
- Regular backup of critical data

### API Security

- Consider implementing authentication for admin endpoints
- Add rate limiting for production deployments
- Monitor API usage and costs

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
SUPABASE_URL=your-production-supabase-url
SUPABASE_SECRET_KEY=your-production-service-role-key
OPENAI_API_KEY=your-production-openai-key
NODE_ENV=production
```

### Post-Deployment

1. Run database migrations on production Supabase (in order)
2. Create initial template data
3. Generate embeddings for existing events
4. Test all API endpoints including template system
5. Verify mobile UI displays correctly on various devices
6. Monitor performance and costs

## Monitoring and Maintenance

### Regular Tasks

- Monitor OpenAI API usage and costs
- Check database performance with vector operations
- Update embeddings for new events
- Review and optimize similarity thresholds
- Track template usage analytics
- Update popular templates based on usage patterns

### Health Checks

- Test API endpoints regularly (events, templates, admin)
- Monitor database connection
- Verify AI features are working
- Check embedding generation performance
- Ensure mobile UI renders correctly
- Verify template search functionality

### Template Management

- Monitor template usage frequency
- Update template descriptions based on user feedback
- Archive unused templates
- Create new templates based on common manual entries

---

_This setup guide covers all aspects of getting Doy-Pal v2.0.0 running with full AI capabilities, template system, and modern mobile UI. For specific feature documentation, refer to the other files in this docs folder._
