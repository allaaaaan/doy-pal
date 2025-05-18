# Doy Pal: Child Behavior Tracking App

## Project Summary

Doy Pal is a mobile-first application designed to help parents track their child's behavior and assign points accordingly. The app allows for manual input of events (like "helped with meal preparation" or "brushed teeth before bed") and associates these events with points. Parents can then use these points as part of a reward system.

### Technology Stack

- **Frontend**: Next.js 15.3.2 with React 19
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (planned integration)
- **Language**: TypeScript
- **UI/UX**: Mobile-first responsive design with dark mode support

### MVP Features

1. **Manual Event Input**

   - Free-text description of behavior/event
   - Point value assignment
   - Date and time are automatically recorded

2. **Event List View**

   - Chronological display of all events
   - Each entry shows event description, points, and timestamp
   - Metadata includes date, time, day of week, day of month

3. **Edit & Delete Events**

   - Ability to modify event descriptions and point values
   - Option to delete events

4. **Points Summary**

   - Display of total points accumulated
   - Weekly and monthly point breakdowns

5. **User Feedback**

   - Toast messages to confirm actions (add, edit, delete)

6. **Data Storage**
   - Supabase integration for data persistence

### Database Schema (Supabase)

The application uses a simple database schema:

1. **events**

   - `id` (uuid, primary key)
   - `description` (text) - Event description
   - `points` (integer) - Points awarded
   - `timestamp` (timestamp) - When the event occurred
   - `day_of_week` (text) - Day of week (for easier querying/filtering)
   - `day_of_month` (integer) - Day of month (for easier querying/filtering)
   - `created_at` (timestamp) - Record creation timestamp
   - `updated_at` (timestamp) - Last update timestamp

2. **point_summaries** (view)
   - `total_points` (integer) - Sum of all points
   - `weekly_points` (integer) - Points in current week
   - `monthly_points` (integer) - Points in current month

### Future Considerations

- Analytics and insights based on collected metadata
- Preset event templates
- Rewards management and redemption
- Goal setting and achievement tracking
- Multi-language support

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

To integrate with Supabase:

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Set up the database tables as per the schema above
3. Add the Supabase URL and secret key to your environment variables:

```
SUPABASE_URL=your-project-url
SUPABASE_SECRET_KEY=your-secret-key
```

## API Routes

The application provides the following API endpoints:

- **GET /api/events** - Get all events
- **POST /api/events** - Create a new event
- **GET /api/events/[id]** - Get a specific event
- **PATCH /api/events/[id]** - Update an event
- **DELETE /api/events/[id]** - Delete an event
- **GET /api/points** - Get point summaries

## Mobile-First Design Considerations

This application is built with a mobile-first approach:

- Responsive UI components that work well on small screens
- Touch-friendly interface elements
- Efficient data loading for mobile networks
- Dark mode support for better readability

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
