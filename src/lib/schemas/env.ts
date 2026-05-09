import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  ADMIN_SESSION_SECRET: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_UPLOAD_BUCKET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  MPESA_CONSUMER_KEY: z.string().optional(),
  MPESA_CONSUMER_SECRET: z.string().optional(),
  AIRTEL_CLIENT_ID: z.string().optional(),
  AIRTEL_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional()
});

export type AppEnv = z.infer<typeof envSchema>;

export function readAppEnv() {
  return envSchema.parse(process.env);
}

export function hasConfiguredValue(value: string | undefined) {
  return Boolean(value && value.trim() && !value.includes("replace-me") && !value.includes("example"));
}
