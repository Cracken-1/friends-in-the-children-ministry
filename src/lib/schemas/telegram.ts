import { z } from "zod";

export const telegramConfigureSchema = z.object({
  botToken: z
    .string()
    .trim()
    .min(10)
    .regex(/^[0-9]+:[A-Za-z0-9_-]+$/, "Bot token format is invalid."),
  channelId: z
    .string()
    .trim()
    .regex(/^@[A-Za-z0-9_]+$|^-[0-9]+$/, "Channel ID must be @channelname or a negative numeric channel ID."),
  webhookUrl: z.string().trim().url().optional(),
  secretToken: z.string().trim().min(12).max(128).optional(),
  mode: z.enum(["webhook", "polling"]).default("webhook")
});
