# TinyCRM

A lightweight, personal CRM built with Next.js for managing contacts, tasks, email, calendar, and journal entries — all in one place.

## Features

- **Contacts** — Store contacts with first/last name, email, phone, company, LinkedIn, tags, and relationship types. Search and filter by type.
- **Gmail Integration** — View your Primary inbox, read email threads, compose and reply — all without leaving the app. Email history shown per-contact.
- **Google Calendar** — Day and week views with multi-calendar support. Click events to see details, join video calls, or open in Google Calendar.
- **Tasks** — Create tasks with status, priority, due dates, and link them to contacts or projects. Filter by date range, group by status/priority/area.
- **Journal** — Markdown-supported notes linked to contacts. Great for call notes, meeting summaries, and general observations.
- **Dashboard** — At-a-glance view of overdue tasks, today's schedule, upcoming items, and recent journal entries.
- **Projects & Areas** — Organize work into projects grouped by areas of responsibility.
- **Activity Log** — Automatic audit trail of all creates, updates, and deletes across the system.
- **Settings** — Manage Google integrations, relationship types, profile, and preferences.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| Language | TypeScript, React 19 |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth v5 (Google OAuth) |
| UI | shadcn/ui + Radix UI + Tailwind CSS 4 |
| Data Fetching | SWR (client), Server Components (server) |
| APIs | Google Calendar API, Gmail API |
| Validation | Zod |
| Markdown | react-markdown + remark-gfm + rehype-sanitize |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google Cloud project with OAuth 2.0 credentials (Calendar and Gmail APIs enabled)

### Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd TinyCRM
   npm install
   ```

2. **Configure environment** — Create `.env.local`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/tinycrm"
   AUTH_SECRET="generate-a-random-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```

5. **Sign in** — Visit `http://localhost:3000` and sign in with Google. On first login, grant Calendar and Gmail permissions when prompted.

### Google Cloud Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Gmail API** and **Google Calendar API**
3. Configure the OAuth consent screen — add scopes for `gmail.readonly`, `gmail.send`, and `calendar.readonly`
4. Create OAuth 2.0 credentials (Web application) with redirect URI: `http://localhost:3000/api/auth/callback/google`

## Project Structure

```
src/
  app/(app)/          # Authenticated pages (dashboard, crm, inbox, calendar, etc.)
  app/api/            # API routes (Gmail, Calendar)
  actions/            # Server actions with Zod validation
  queries/            # Server-side query functions
  components/         # UI components organized by feature
  lib/                # Shared utilities (auth, prisma, google APIs, parsers)
  types/              # TypeScript type definitions
prisma/
  schema.prisma       # Database schema
  migrations/         # SQL migrations
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
