# Friends in the Children Ministry

A children's ministry platform built with Next.js, Supabase, and Prisma for Sunday School coordinators and teachers in Kenya.

## What It Covers

- Public lessons, blog posts, Bible studies, resources, and events
- Admin CMS for lessons, blog, Bible studies, resources, events, teaching tips, and users
- Role-aware admin access for `System Admin` and `Editor`
- Supabase-authenticated admin sessions
- Telegram history import, media matching, review, and lesson promotion
- Direct-to-Supabase upload flow with local fallback for development
- Audit logs, settings surfaces, and platform readiness checks

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Prisma 7
- PostgreSQL
- Supabase Auth and Storage

## Local Setup

1. Install Node.js 20+ with npm.
2. Copy `.env.example` to `.env.local`.
3. Fill in PostgreSQL, Supabase, and other service variables.
4. Install dependencies:

```powershell
npm install
```

5. Generate Prisma client and apply migrations:

```powershell
npm run db:generate
npm run db:migrate
```

6. Seed the first admin user:

```powershell
npm run db:seed
```

7. Start the development server:

```powershell
npm run dev
```

## Verification

```powershell
npm run typecheck
npm run build
```

## Deployment Notes

This project is designed for a PostgreSQL-backed deployment with Supabase handling authentication and storage. Vercel works well for frontend hosting and preview testing, while the database can remain on Supabase or any compatible PostgreSQL provider.
