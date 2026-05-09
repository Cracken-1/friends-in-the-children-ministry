# Security Checklist

## Implemented Foundation

- Strict security headers in `next.config.mjs`.
- Zod schemas for content, newsletter, login, and upload configuration.
- Rate-limit helper with Upstash Redis support and local no-Redis fallback.
- Upload service validates configured size and detected MIME type.
- Payment phone normalization utility with tests.
- Append-only payment and admin audit log models.

## Must Complete Before Production

- Supabase Auth middleware for all `/admin` and admin API routes.
- RLS policies for every table in Supabase.
- Signed private download URLs for premium or private files.
- Callback IP validation for Safaricom and Airtel endpoints.
- Hashed one-time premium access tokens with 24-hour expiry.
- TOTP confirmation for emergency session clearing.
- Dependency scanning with Snyk or equivalent.
- OWASP Top 10 review before launch.
