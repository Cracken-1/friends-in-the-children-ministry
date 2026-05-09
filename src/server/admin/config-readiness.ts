import "server-only";

import { getSystemReadiness } from "@/server/system/readiness";

const readiness = getSystemReadiness();

function checkIsReady(key: string) {
  return readiness.checks.find((check) => check.key === key)?.state === "ready";
}

function checkIsFallback(key: string) {
  return readiness.checks.find((check) => check.key === key)?.state === "fallback";
}

export const adminConfigReadiness = {
  database: checkIsReady("database"),
  supabase: checkIsReady("supabase"),
  uploads: checkIsReady("storage") || checkIsFallback("storage"),
  telegram: checkIsReady("telegram"),
  email: checkIsReady("email"),
  payments: checkIsReady("payments"),
  rateLimit: checkIsReady("rate_limit")
} as const;

export const adminReadinessSummary = readiness.checks.map((check) => ({
  label: check.label,
  status: check.state,
  note: check.note
})) as ReadonlyArray<{
  label: string;
  status: "ready" | "fallback" | "pending";
  note: string;
}>;
