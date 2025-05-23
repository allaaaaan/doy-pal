# Doy-Pal Documentation Index

Welcome to the complete documentation for Doy-Pal, an AI-enhanced mobile-first child behavior tracking application with intelligent templates and modern UI design.

## 📖 Documentation Structure

### Getting Started

- **[Setup Guide](./setup.md)** - Complete installation and configuration instructions
- **[Main README](../README.md)** - Project overview and latest features

### Technical Documentation

- **[Database Schema](./database-schema.md)** - Complete database structure with AI enhancements
- **[AI Features](./ai-features.md)** - Detailed AI capabilities and embedding system

### API Documentation

- **[Event Management APIs](./api-events.md)** - Core CRUD operations for events
- **[Admin APIs](./api-admin.md)** - Advanced AI-powered administrative features

### Implementation Guides

- **[AI Template System](./ai-template-implementation-summary.md)** - Template system implementation details
- **[Template Linking Guide](./events-templates-linking-guide.md)** - Events-templates relationship

## 🚀 Quick Start

1. **New to the project?** Start with the [Main README](../README.md)
2. **Setting up development?** Follow the [Setup Guide](./setup.md)
3. **Integrating APIs?** Check [Event Management APIs](./api-events.md) and [Admin APIs](./api-admin.md)
4. **Understanding the AI features?** Read [AI Features](./ai-features.md)
5. **Database work?** Refer to [Database Schema](./database-schema.md)

## 🧩 Core Features Covered

### Smart Template System ✨

- **Template Selection**: Intelligent dropdown with fuzzy search
- **Auto-fill Functionality**: Pre-populate event forms with template data
- **Usage Tracking**: Frequency-based template popularity
- **Manual Entry**: Always available "Create Manually" option
- **Template Management**: CRUD operations with admin APIs

### AI-Powered Features 🤖

- **Multilingual Support**: Automatic translation to English
- **Semantic Search**: Find similar events using AI embeddings
- **Auto-Categorization**: Group related behaviors automatically
- **Cross-Language Matching**: Compare events regardless of input language
- **Batch Processing**: Efficient bulk operations with rate limiting

### Modern Mobile UI 📱

- **Card-Based Design**: Modern rounded corners and shadows
- **Touch Optimization**: Proper spacing for mobile interaction
- **Safe Area Support**: Compatible with devices with notches
- **Native Controls**: Custom-styled date/time pickers
- **Responsive Layout**: Mobile-first with tablet/desktop support
- **Dark Mode**: Full theme support with system detection

### Enhanced Event Management 🏆

- **Event Names**: Optional field with auto-generation from description
- **Template Integration**: Events link to templates for tracking
- **Point System**: 1-100 point range with visual indicators
- **Swipe Gestures**: Mobile-friendly event interactions
- **Rich Editing**: Comprehensive edit capabilities with validation

### Technical Highlights

- **Next.js 15.3.2** with React 19 and App Router
- **PostgreSQL** with pgvector for similarity search
- **OpenAI Integration** for embeddings and translation
- **Supabase Backend** with real-time capabilities
- **TypeScript** for type safety and better DX
- **Heroicons** for consistent iconography
- **PWA Support** with offline capabilities

## 📊 API Endpoints Overview

### Event Management (`/api/events/`)

- `GET /api/events` - List all events with template information
- `POST /api/events` - Create new event with AI processing
- `GET /api/events/[id]` - Get specific event details
- `PATCH /api/events/[id]` - Update event with AI re-processing
- `DELETE /api/events/[id]` - Soft delete event
- `GET /api/points` - Get comprehensive points summary

### Template Management (`/api/templates/`)

- `GET /api/templates` - List all active templates
- `POST /api/templates` - Create new template
- `GET /api/templates/[id]` - Get specific template
- `PATCH /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Deactivate template

### Admin Features (`/api/admin/`)

- `POST /api/admin/events/similar` - Find similar events with thresholds
- `POST /api/admin/events/embedding` - Generate embeddings for events
- `POST /api/admin/events/update-all-embeddings` - Batch process embeddings
- `GET /api/admin/events/categories` - Auto-categorize events by behavior

## 🔧 Recent Major Updates

### v2.0.0 - AI-Enhanced Experience

The application has been significantly enhanced with modern features:

1. **Smart Template System**: Searchable template selector with auto-fill functionality
2. **AI Integration**: OpenAI-powered translation and embedding generation
3. **Modern UI Design**: Card-based layout with mobile optimizations
4. **Enhanced Events**: Added name field with auto-generation capabilities
5. **Mobile Improvements**: Safe area support and touch-optimized controls
6. **Performance**: Optimized for modern devices with PWA capabilities

### UI/UX Enhancements

- **Mobile-First Redesign**: Completely rebuilt for touch devices
- **Visual Hierarchy**: Gradient headers and modern spacing
- **Interactive Elements**: Swipe gestures and haptic feedback
- **Accessibility**: Improved contrast ratios and keyboard navigation
- **Loading States**: Skeleton screens and progress indicators

### Database Enhancements

- **Template Schema**: New templates table with usage tracking
- **AI Fields**: Added `normalized_description` and `description_embedding`
- **Event Names**: Optional `name` field with auto-generation
- **Template Links**: `template_id` references for tracking usage
- **Vector Search**: pgvector indexes for similarity operations

### API Improvements

- **Enhanced Endpoints**: All CRUD operations support new fields
- **AI Processing**: Automatic translation and embedding on create/update
- **Template Integration**: Template usage tracking and frequency updates
- **Error Handling**: Comprehensive error responses with helpful messages
- **Performance**: Optimized queries with proper indexing

## 🛠️ Development Workflow

### For Frontend Developers

1. **UI Components**: Check `/components/` for reusable elements
2. **Page Structure**: App Router pages in `/app/` directory
3. **Styling**: Tailwind CSS with custom mobile optimizations
4. **State Management**: React hooks with local state patterns

### For Backend Developers

1. **API Routes**: Next.js API routes in `/app/api/` directory
2. **Database**: Supabase with PostgreSQL and vector extensions
3. **AI Integration**: OpenAI utilities in `/app/utils/` directory
4. **Migrations**: Database changes in `/supabase/migrations/`

### For Administrators

1. **Template Management**: Use admin APIs for bulk operations
2. **AI Processing**: Monitor embedding generation and costs
3. **Performance**: Configure similarity thresholds and batch sizes
4. **Analytics**: Track template usage and user behavior patterns

## 📈 Usage Patterns

### Basic Event Tracking

- **Template Selection**: Choose from popular behavior templates
- **Manual Entry**: Create custom events when templates don't fit
- **AI Processing**: Automatic translation and similarity detection
- **Point Tracking**: Accumulate points with visual progress indicators

### Advanced Features

- **Cross-Language Support**: Events work regardless of input language
- **Similar Event Detection**: Prevent duplicates with AI matching
- **Template Analytics**: Track which templates are most popular
- **Batch Operations**: Process multiple events efficiently

## 🔍 Search and Discovery

### Finding Information

- **Setup Issues**: [Setup Guide](./setup.md) with troubleshooting
- **API Integration**: [Event APIs](./api-events.md) and [Admin APIs](./api-admin.md)
- **Database Schema**: [Database Documentation](./database-schema.md)
- **AI Features**: [AI Features Guide](./ai-features.md)
- **Template System**: [AI Template Implementation](./ai-template-implementation-summary.md)

### Code Examples

Each documentation file includes:

- **Complete Examples**: Full API request/response samples
- **Code Snippets**: TypeScript/React integration patterns
- **Error Handling**: Best practices for error management
- **Performance Tips**: Optimization suggestions and patterns

## 📚 Additional Resources

### External Documentation

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

### Related Technologies

- [Tailwind CSS 4](https://tailwindcss.com/docs) for styling
- [TypeScript](https://www.typescriptlang.org/docs/) for type safety
- [React 19](https://react.dev/) for UI components
- [Heroicons](https://heroicons.com/) for iconography

## 🎯 Key Components

### Core UI Components

- **`TemplateSelector`**: Smart template chooser with search
- **`EventItem`**: Swipeable event display with actions
- **`FloatingActionButton`**: Quick access to event creation
- **`TemplateQuickTip`**: Onboarding for new users
- **`EventHistory`**: Timeline display with template indicators

### Utility Functions

- **`translateAndGenerateEmbedding`**: AI processing pipeline
- **Template Search**: Fuzzy matching for template selection
- **Date Formatting**: Consistent timestamp handling
- **Safe Area Handling**: Mobile device compatibility

---

## 💡 Contributing to Documentation

This documentation is maintained alongside the codebase. When adding new features:

1. **Update API Documentation**: Add new endpoints and examples
2. **Update Database Schema**: Document any schema changes
3. **Add Usage Examples**: Include practical implementation examples
4. **Update Component Docs**: Document new UI components and patterns
5. **Test Examples**: Ensure all code examples work correctly

---

_Last updated: January 2025 - Reflects the latest v2.0.0 release with template system, AI enhancements, and modern mobile UI._
