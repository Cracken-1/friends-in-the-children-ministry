import "server-only";

import { readAppEnv, hasConfiguredValue } from "@/lib/schemas/env";
import { isDatabaseConfigured } from "@/server/db/client";

type ServiceState = "ready" | "fallback" | "pending";

export type ReadinessCheck = {
  key: string;
  label: string;
  state: ServiceState;
  note: string;
};

function asState(ready: boolean, fallback = false): ServiceState {
  if (ready) return "ready";
  return fallback ? "fallback" : "pending";
}

export function getSystemReadiness() {
  const env = readAppEnv();

  const supabaseReady =
    hasConfiguredValue(env.NEXT_PUBLIC_SUPABASE_URL) &&
    hasConfiguredValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    hasConfiguredValue(env.SUPABASE_SERVICE_ROLE_KEY);

  const storageReady =
    hasConfiguredValue(env.NEXT_PUBLIC_SUPABASE_URL) &&
    hasConfiguredValue(env.SUPABASE_SERVICE_ROLE_KEY) &&
    hasConfiguredValue(env.SUPABASE_UPLOAD_BUCKET);

  const telegramReady =
    hasConfiguredValue(env.TELEGRAM_BOT_TOKEN) &&
    hasConfiguredValue(env.TELEGRAM_WEBHOOK_SECRET);

  const paymentsReady =
    hasConfiguredValue(env.MPESA_CONSUMER_KEY) &&
    hasConfiguredValue(env.MPESA_CONSUMER_SECRET) &&
    hasConfiguredValue(env.AIRTEL_CLIENT_ID) &&
    hasConfiguredValue(env.AIRTEL_CLIENT_SECRET);

  const rateLimitReady =
    hasConfiguredValue(env.UPSTASH_REDIS_REST_URL) &&
    hasConfiguredValue(env.UPSTASH_REDIS_REST_TOKEN);

  const emailReady = hasConfiguredValue(env.RESEND_API_KEY);

  const checks: ReadinessCheck[] = [
    {
      key: "database",
      label: "PostgreSQL database",
      state: asState(isDatabaseConfigured),
      note: isDatabaseConfigured
        ? "Database connection string is present for Prisma-backed content persistence."
        : "DATABASE_URL and DIRECT_URL still need real PostgreSQL values."
    },
    {
      key: "supabase",
      label: "Supabase auth",
      state: asState(supabaseReady),
      note: supabaseReady
        ? "Supabase keys are present for the next auth and storage integration pass."
        : "Local admin login remains active until Supabase keys are configured."
    },
    {
      key: "storage",
      label: "File storage",
      state: asState(storageReady, true),
      note: storageReady
        ? "Supabase storage credentials and upload bucket are present for cloud file persistence."
        : "Local fallback uploads are active so content work can continue before cloud storage is wired."
    },
    {
      key: "telegram",
      label: "Telegram ingestion",
      state: asState(telegramReady),
      note: telegramReady
        ? "Telegram credentials are present for webhook validation and worker-backed processing."
        : "Telegram UI and routes are scaffolded, but live bot credentials are not fully configured."
    },
    {
      key: "email",
      label: "Email delivery",
      state: asState(emailReady),
      note: emailReady
        ? "Resend key is present for newsletters and operational email."
        : "Newsletter UI is ready, but email delivery is not configured yet."
    },
    {
      key: "payments",
      label: "Payments",
      state: asState(paymentsReady),
      note: paymentsReady
        ? "Mpesa and Airtel credentials are available for secure payment wiring."
        : "Payment services still need real credentials before checkout can go live."
    },
    {
      key: "rate_limit",
      label: "Shared rate limiting",
      state: asState(rateLimitReady),
      note: rateLimitReady
        ? "Upstash Redis is configured for shared request throttling."
        : "Rate-limit code exists, but Redis credentials are still missing or placeholder."
    }
  ];

  const readyCount = checks.filter((check) => check.state === "ready").length;
  const fallbackCount = checks.filter((check) => check.state === "fallback").length;
  const pendingCount = checks.filter((check) => check.state === "pending").length;

  return {
    generatedAt: new Date().toISOString(),
    environment: env.NODE_ENV ?? "development",
    summary: {
      readyCount,
      fallbackCount,
      pendingCount
    },
    checks
  };
}
