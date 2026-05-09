# Project Brief

## Decision Summary

This rebuild follows the supplied master prompt and feature analysis: Next.js App Router, strict TypeScript, shadcn/ui-compatible Tailwind, Prisma, Supabase PostgreSQL/Auth/Storage, Redis rate limits and queues, tRPC for admin mutations, and Zod for all inputs.

## Phase 1 Scope

- Project scaffolding and CI.
- Prisma schema and migration path.
- Supabase-ready auth boundary.
- Security headers and rate limit helpers.
- Public pages for lessons, blog, resources, events, and about.
- Admin dashboard, lessons, and blog surfaces.
- Admin Lesson and Blog mutations through tRPC.

## Later Phases

- Phase 2: Bible studies, file uploads, Supabase Storage, teaching tips, PDF generation, newsletter management.
- Phase 3: M-Pesa, Airtel Money, premium access tokens, immutable payment audit logs.
- Phase 4: grammY Telegram webhook, queue-backed import processing, migration dashboard.
- Phase 5: system settings, backups, cleanup tools, analytics, admin users.
- Phase 6: penetration test, performance audit, load testing, monitoring, launch runbooks.

## Security Notes

- JWTs must be stored in httpOnly, Secure, SameSite=Strict cookies after Supabase Auth is connected.
- All admin routes must become server-side protected before production deployment.
- Uploads remain write-disabled until Supabase buckets, RLS policies, signed URLs, and magic-byte validation are wired end to end.
- Payment callbacks must be idempotent and logged in append-only tables.
- Secrets belong in Vercel environment variables or a secret manager, never in the client bundle.

## Next Step

Install dependencies, connect Supabase credentials, generate the first Prisma migration, then replace the temporary auth boundary with Supabase server-side session checks.
