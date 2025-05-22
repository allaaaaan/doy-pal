# Doy-Pal Documentation Index

Welcome to the complete documentation for Doy-Pal, a mobile-first child behavior tracking application with advanced AI capabilities.

## 📖 Documentation Structure

### Getting Started

- **[Setup Guide](./setup.md)** - Complete installation and configuration instructions
- **[Main README](./README.md)** - Project overview and current features

### Technical Documentation

- **[Database Schema](./database-schema.md)** - Complete database structure and AI enhancements
- **[AI Features](./ai-features.md)** - Detailed AI capabilities and embedding system

### API Documentation

- **[Event Management APIs](./api-events.md)** - Core CRUD operations for events
- **[Admin APIs](./api-admin.md)** - Advanced AI-powered administrative features

## 🚀 Quick Start

1. **New to the project?** Start with the [Main README](./README.md)
2. **Setting up development?** Follow the [Setup Guide](./setup.md)
3. **Integrating APIs?** Check [Event Management APIs](./api-events.md) and [Admin APIs](./api-admin.md)
4. **Understanding the AI features?** Read [AI Features](./ai-features.md)
5. **Database work?** Refer to [Database Schema](./database-schema.md)

## 🧩 Core Features Covered

### Basic Functionality

- Event creation, editing, and deletion
- Point-based reward system
- Time-based analytics and summaries
- Mobile-first responsive design

### AI-Powered Features ✨

- **Multilingual Support**: Automatic translation to English
- **Semantic Search**: Find similar events using AI embeddings
- **Auto-Categorization**: Group related behaviors automatically
- **Cross-Language Matching**: Compare events regardless of input language
- **Batch Processing**: Efficient bulk operations with rate limiting

### Technical Highlights

- Next.js 15.3.2 with React 19
- PostgreSQL with pgvector for similarity search
- OpenAI integration for embeddings and translation
- Supabase backend with real-time capabilities
- TypeScript for type safety

## 📊 API Endpoints Overview

### Event Management (`/api/events/`)

- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get specific event
- `PATCH /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Soft delete event
- `GET /api/points` - Get points summary

### Admin Features (`/api/admin/events/`)

- `POST /api/admin/events/similar` - Find similar events
- `POST /api/admin/events/update-all-embeddings` - Batch generate embeddings
- `GET /api/admin/events/categories` - Auto-categorize events

## 🔧 Recent Major Updates

### AI Enhancement Pipeline

The application has been significantly enhanced with AI capabilities:

1. **Translation System**: All events are automatically translated to English for consistent processing
2. **Vector Embeddings**: Using OpenAI's `text-embedding-3-large` model for semantic understanding
3. **Similarity Search**: Real-time similarity matching with configurable thresholds
4. **Batch Processing**: Efficient bulk embedding generation with proper rate limiting
5. **Cross-Language Support**: Events in any language can be compared and categorized

### Database Enhancements

- Added `normalized_description` column for English translations
- Added `description_embedding` vector column (1536 dimensions)
- Implemented vector similarity indexes for fast searches
- Created PostgreSQL functions for similarity operations

### API Improvements

- New admin endpoints for AI features
- Enhanced error handling and logging
- Configurable similarity thresholds
- Comprehensive batch processing capabilities

## 🛠️ Development Workflow

### For Developers

1. Set up development environment using [Setup Guide](./setup.md)
2. Understand the database structure from [Database Schema](./database-schema.md)
3. Implement features using [Event APIs](./api-events.md)
4. Integrate AI features using [Admin APIs](./api-admin.md)

### For Administrators

1. Use admin APIs to manage embeddings and categorization
2. Monitor AI processing costs and performance
3. Configure similarity thresholds based on use cases
4. Manage bulk operations during off-peak hours

## 📈 Usage Patterns

### Basic Event Tracking

- Parents input behavioral events with point values
- System automatically tracks time-based metadata
- Points are aggregated for weekly/monthly summaries

### AI-Enhanced Workflow

- Events are automatically translated and embedded
- Similar events are detected to prevent duplicates
- Events are automatically categorized by behavior type
- Cross-language matching enables global usability

## 🔍 Search and Discovery

### Finding Information

- **Setup Issues**: [Setup Guide](./setup.md) troubleshooting section
- **API Usage**: Examples in [Event APIs](./api-events.md) and [Admin APIs](./api-admin.md)
- **Database Questions**: [Database Schema](./database-schema.md) with full structure
- **AI Features**: [AI Features](./ai-features.md) with detailed explanations

### Code Examples

Each documentation file includes:

- Complete API request/response examples
- JavaScript/TypeScript code snippets
- Error handling patterns
- Integration examples with React

## 📚 Additional Resources

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

### Related Technologies

- [Tailwind CSS](https://tailwindcss.com/docs) for styling
- [TypeScript](https://www.typescriptlang.org/docs/) for type safety
- [React 19](https://react.dev/) for UI components

---

## 💡 Contributing to Documentation

This documentation is maintained alongside the codebase. When adding new features:

1. Update relevant API documentation
2. Add code examples and usage patterns
3. Update the database schema if needed
4. Include troubleshooting information
5. Update this index if new documentation files are added

---

_Last updated: January 2024 - Reflects the latest AI enhancements and embedding system implementation._
