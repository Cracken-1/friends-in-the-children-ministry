# Implementation Plan

## Sprint 1

- Install dependencies and verify the generated app.
- Configure Supabase project and local `.env.local`.
- Generate and apply the initial Prisma migration.
- Add Supabase server client and admin session middleware.
- Seed super admin and starter public content.

## Sprint 2

- Finish Lesson and Blog CRUD screens.
- Add forms with shared Zod schemas.
- Add admin audit logging around all mutations.
- Add loading, empty, and error states for public and admin pages.
- Add integration tests for public API routes.

## Sprint 3

- Add Bible study models and pages.
- Wire Supabase Storage buckets.
- Implement authenticated upload endpoint with signed URLs.
- Add newsletter confirmation and unsubscribe flows.
- Prepare PDF job queue contract.
