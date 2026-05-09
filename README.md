# Ministry Platform Rebuild

Ground-up rebuild of the Sunday School / children's ministry platform described in `docs/project-brief.md`.

## Current Slice

- Next.js App Router workspace foundation.
- Strict TypeScript, Tailwind, Prisma, tRPC, Zod, Supabase-ready structure.
- Core database schema for content, payments, Telegram imports, settings, audit logs, and newsletters.
- Public page skeletons for lessons, blog, resources, events, and about.
- Admin dashboard skeleton with first management areas.
- Security headers, upload validation helpers, and CI workflow.

## Local Setup

1. Install Node.js 20+ with npm.
2. Copy `.env.example` to `.env.local` and fill in real service values.
3. Run `npm install`.
4. Run `npm run db:generate`.
5. Run `npm run dev`.

Production work must follow the phased delivery plan and definition of done in `docs/project-brief.md`.
