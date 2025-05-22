# Setup Guide

This guide provides step-by-step instructions for setting up the Doy-Pal application, including all dependencies, environment configuration, and database setup.

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
- TypeScript and Tailwind CSS

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

### 1. Initial Schema Migration

Run the initial migration in your Supabase SQL editor:

```bash
# Copy the content of supabase/migrations/20240320000000_init.sql
# and execute it in Supabase SQL Editor
```

### 2. AI Enhancement Migrations

Execute the following SQL scripts in order:

**Add Embedding Support**:

```bash
# Execute scripts/add_embedding_column.sql
```

**Add Multilingual Support**:

```bash
# Execute scripts/add_normalized_description.sql
```

### 3. Enable Required Extensions

Ensure these PostgreSQL extensions are enabled in Supabase:

```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Verify Database Setup

Check that all tables and functions are created:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```

Expected tables: `events`
Expected views: `point_summaries`
Expected functions: `find_similar_events`, `categorize_events`

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

### 1. Add Sample Events

You can add sample events through the application UI or via API:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Helped set the table",
    "points": 2
  }'
```

### 2. Generate Embeddings

After adding events, generate embeddings for AI features:

```bash
curl -X POST http://localhost:3000/api/admin/events/update-all-embeddings
```

### 3. Test Similarity Search

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

### Similarity Search Settings

Adjust these values in the API calls based on your needs:

- **Threshold**: 0.4-0.9 (lower = more results, higher = more precise)
- **Limit**: 1-50 (maximum results to return)
- **Batch Size**: 3 (for bulk embedding updates)

### Performance Tuning

#### Database Optimization

```sql
-- Adjust vector index parameters for larger datasets
DROP INDEX IF EXISTS events_description_embedding_idx;
CREATE INDEX events_description_embedding_idx
ON events USING ivfflat (description_embedding vector_cosine_ops)
WITH (lists = 200); -- Increase lists for larger datasets
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

### Database Issues

#### Missing Functions

If database functions are missing:

```sql
-- Check function exists
SELECT * FROM pg_proc WHERE proname = 'find_similar_events';

-- If missing, re-run the migration:
-- Execute scripts/add_embedding_column.sql
```

#### Performance Issues

For large datasets:

1. Increase vector index lists parameter
2. Add composite indexes for common queries
3. Consider archiving old events

### API Issues

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

1. Run database migrations on production Supabase
2. Generate embeddings for existing events
3. Test all API endpoints
4. Monitor performance and costs

## Monitoring and Maintenance

### Regular Tasks

- Monitor OpenAI API usage and costs
- Check database performance with vector operations
- Update embeddings for new events
- Review and optimize similarity thresholds

### Health Checks

- Test API endpoints regularly
- Monitor database connection
- Verify AI features are working
- Check embedding generation performance

---

_This setup guide covers all aspects of getting Doy-Pal running with full AI capabilities. For specific feature documentation, refer to the other files in this docs folder._
