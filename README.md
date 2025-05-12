# Doy-Pal: Child Behavior Tracking App

## Project Summary

Doy-Pal is a simple application designed to help parents track their child's behavior and assign points accordingly. The app allows for manual input of events (like "helped with meal preparation" or "brushed teeth before bed") and associates these events with points. Parents can then use these points as part of a reward system.

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

5. **User Feedback**

   - Toast messages to confirm actions (add, edit, delete)

6. **Data Storage**
   - Local storage for proof of concept
   - No user accounts or cloud sync for MVP

### Non-Features (for MVP)

- No preset list of events
- No multi-child support
- No rewards management within the app
- No charts or advanced analytics

### Future Considerations

- Supabase integration for data persistence
- Analytics and insights based on collected metadata
- Multi-child support
- Preset event templates
- Rewards management

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
