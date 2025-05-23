# Doy Pal: AI-Enhanced Child Behavior Tracking App

## Project Summary

Doy Pal is a modern, mobile-first application designed to help parents track their child's behavior with an AI-enhanced experience. The app features intelligent template suggestions, automatic translation, semantic analysis, and a beautiful, intuitive interface optimized for mobile devices.

### Technology Stack

- **Frontend**: Next.js 15.3.2 with React 19
- **Styling**: Tailwind CSS 4 with custom mobile optimizations
- **Database**: Supabase with PostgreSQL and pgvector for AI features
- **AI Integration**: OpenAI API for translation and embeddings
- **Language**: TypeScript
- **UI/UX**: Mobile-first responsive design with dark mode support
- **Icons**: Heroicons for consistent iconography
- **PWA**: Progressive Web App capabilities

## ✨ Key Features

### 🎯 **Smart Template System**

- **Pre-defined templates** for common child behaviors
- **Intelligent search** with fuzzy matching
- **Auto-fill functionality** for quick event creation
- **Usage tracking** to suggest popular templates
- **Manual entry option** always available

### 🤖 **AI-Powered Event Processing**

- **Automatic translation** to English for consistency
- **Semantic embeddings** using OpenAI's text-embedding-3-large
- **Cross-language event matching** and similarity detection
- **Intelligent categorization** and analysis
- **Multilingual support** with seamless experience

### 📱 **Modern Mobile-First UI**

- **Card-based design** with rounded corners and shadows
- **Floating action button** for quick access
- **Touch-optimized controls** with proper spacing
- **Safe area support** for devices with notches
- **Native date/time pickers** with custom icons
- **Gradient headers** and modern visual hierarchy

### 🏆 **Comprehensive Event Management**

- **Event name field** (optional, auto-generates from description)
- **Rich descriptions** with multi-line support
- **Point-based rewards** system (1-100 points)
- **Automatic timestamp** tracking
- **Edit and delete** capabilities with confirmation
- **Swipe gestures** for mobile interaction

### 📊 **Analytics & Insights**

- **Total points** tracking with visual summaries
- **Event history** with template indicators
- **Weekly and monthly** breakdowns
- **Template usage** analytics
- **Achievement tracking**

## 🗄️ Database Schema

### **events**

```sql
- id (uuid, primary key)
- name (text, optional) - Event title/name
- description (text) - Detailed event description
- points (integer) - Points awarded (1-100)
- timestamp (timestamptz) - When the event occurred
- day_of_week (text) - Day of week for easy filtering
- day_of_month (integer) - Day of month for analytics
- created_at (timestamptz) - Record creation
- updated_at (timestamptz) - Last modification
- is_active (boolean) - Soft delete flag
- normalized_description (text) - AI-translated English version
- description_embedding (vector) - AI embedding for similarity
- template_id (uuid) - Reference to template used (optional)
```

### **templates**

```sql
- id (uuid, primary key)
- name (text) - Template name/title
- description (text) - Template description
- default_points (integer) - Suggested point value
- frequency (integer) - Usage count for popularity
- ai_confidence (float) - AI matching confidence
- last_seen (timestamptz) - Last usage timestamp
- is_active (boolean) - Active status
- created_at (timestamptz) - Creation timestamp
- updated_at (timestamptz) - Last modification
```

### **point_summaries** (view)

```sql
- total_points (integer) - Sum of all points
- weekly_points (integer) - Current week total
- monthly_points (integer) - Current month total
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-repo/doy-pal.git
cd doy-pal
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Add your environment variables:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_SECRET_KEY=your-supabase-secret-key
OPENAI_API_KEY=your-openai-api-key
```

4. **Run database migrations**

```sql
-- Run the SQL files in supabase/migrations/ in order
-- This sets up the database schema with AI capabilities
```

5. **Start development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔌 API Endpoints

### **Event Management**

- `GET /api/events` - List all events with template info
- `POST /api/events` - Create event with AI processing
- `GET /api/events/[id]` - Get specific event
- `PATCH /api/events/[id]` - Update event with AI re-processing
- `DELETE /api/events/[id]` - Soft delete event

### **Templates**

- `GET /api/templates` - List all active templates
- `POST /api/templates` - Create new template
- `GET /api/templates/[id]` - Get specific template
- `PATCH /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Deactivate template

### **Analytics**

- `GET /api/points` - Get points summary
- `GET /api/schema` - Get database schema info

### **Admin Features**

- `POST /api/admin/events/similar` - Find similar events
- `POST /api/admin/events/embedding` - Generate embeddings
- `POST /api/admin/events/update-all-embeddings` - Batch process
- `GET /api/admin/events/categories` - Auto-categorize events

## 🎨 User Experience Features

### **Mobile Optimizations**

- **Safe area insets** for modern devices
- **Touch-friendly** button sizes and spacing
- **Swipe gestures** for event actions
- **Native input controls** with custom styling
- **Haptic feedback** support (where available)

### **Dark Mode Support**

- **System preference** detection
- **Manual toggle** capability
- **Consistent theming** across all components
- **Proper contrast** ratios for accessibility

### **Progressive Web App**

- **Installable** on mobile devices
- **Offline capabilities** with service worker
- **App-like experience** with native feel
- **Background sync** for seamless updates

## 🧠 AI Features Deep Dive

### **Translation Pipeline**

```typescript
// Automatic translation for consistency
const aiResult = await translateAndGenerateEmbedding(description);
// Stores: normalized_description, description_embedding
```

### **Similarity Detection**

```typescript
// Find similar events across languages
const similar = await findSimilarEvents(eventId, threshold: 0.8);
// Returns events with similarity scores
```

### **Template Intelligence**

- **Smart suggestions** based on partial input
- **Usage frequency** tracking for popularity
- **AI confidence** scoring for matches
- **Cross-language** template matching

## 🔧 Development

### **Project Structure**

```
doy-pal/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── event/             # Event creation page
│   ├── home/              # Main dashboard
│   └── utils/             # Utilities (embeddings, etc.)
├── components/            # Reusable UI components
├── docs/                  # Documentation
├── public/                # Static assets
├── supabase/             # Database migrations
└── scripts/              # Utility scripts
```

### **Key Components**

- **TemplateSelector** - Smart template chooser with search
- **EventItem** - Swipeable event display with actions
- **FloatingActionButton** - Quick access to event creation
- **TemplateQuickTip** - Onboarding for new users

### **Build & Deploy**

```bash
# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📚 Documentation

For detailed documentation, visit the [docs](./docs/) directory:

- **[Setup Guide](./docs/setup.md)** - Complete setup instructions
- **[API Documentation](./docs/api-events.md)** - Detailed API reference
- **[AI Features](./docs/ai-features.md)** - AI capabilities guide
- **[Database Schema](./docs/database-schema.md)** - Complete schema reference

## 🛠️ Recent Updates

### v2.0.0 - AI-Enhanced Experience

- ✅ Smart template system with search
- ✅ OpenAI integration for translation and embeddings
- ✅ Modern mobile-first UI redesign
- ✅ Event name field with auto-generation
- ✅ Improved mobile layout with safe areas
- ✅ Cross-language event matching
- ✅ Heroicons integration for consistency
- ✅ Enhanced error handling and user feedback

### UI/UX Improvements

- ✅ Card-based design with modern shadows
- ✅ Gradient headers and visual hierarchy
- ✅ Touch-optimized controls and spacing
- ✅ Native date/time pickers with custom icons
- ✅ Swipe gestures for mobile interaction
- ✅ Loading states and skeleton animations

### Technical Enhancements

- ✅ TypeScript strict mode compliance
- ✅ Next.js 15 App Router optimization
- ✅ PWA capabilities with offline support
- ✅ Vector similarity search with pgvector
- ✅ Comprehensive error boundaries
- ✅ Performance optimizations

## 🚀 Deployment

### **Vercel (Recommended)**

```bash
npm install -g vercel
vercel
```

### **Environment Setup**

Ensure all environment variables are configured:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SECRET_KEY` - Service role key
- `OPENAI_API_KEY` - OpenAI API key for AI features

### **Database Migration**

Run migrations in order:

```sql
1. 20240320000000_init.sql
2. 20250101000001_create_templates.sql
3. 20250101000002_add_name_to_events.sql
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing powerful AI capabilities
- **Supabase** for the excellent backend platform
- **Vercel** for seamless deployment experience
- **Heroicons** for beautiful, consistent icons
- **Tailwind CSS** for the utility-first CSS framework

---

**Doy Pal** - Making child behavior tracking intelligent, beautiful, and effortless. 🌟
