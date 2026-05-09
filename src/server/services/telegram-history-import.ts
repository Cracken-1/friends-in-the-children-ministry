import "server-only";

import { z } from "zod";

import { normalizeTelegramRelativePath, writeTelegramImportContent } from "@/server/services/telegram-import-content";

const telegramTextEntitySchema = z.union([
  z.string(),
  z.object({
    text: z.string().optional()
  }).passthrough()
]);

const telegramMessageSchema = z.object({
  id: z.number().int(),
  type: z.string().optional(),
  date: z.string().optional(),
  date_unixtime: z.string().optional(),
  text: z.union([z.string(), z.array(telegramTextEntitySchema)]).optional(),
  caption: z.string().optional(),
  media_type: z.string().optional(),
  mime_type: z.string().optional(),
  file: z.string().optional(),
  file_name: z.string().optional(),
  thumbnail: z.string().optional(),
  grouped_id: z.union([z.string(), z.number()]).optional(),
  duration_seconds: z.number().optional()
}).passthrough();

const telegramExportSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  id: z.union([z.string(), z.number()]).optional(),
  messages: z.array(telegramMessageSchema)
});

function flattenTelegramText(
  value: z.infer<typeof telegramMessageSchema>["text"]
) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      return entry.text ?? "";
    })
    .join("")
    .trim();
}

function buildImportRecord(
  message: z.infer<typeof telegramMessageSchema>,
  channelName: string | undefined
) {
  const text = flattenTelegramText(message.text);
  const summary = message.caption?.trim() || text || "Telegram history import";
  const mediaRefs = [message.file, message.thumbnail].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );

  return {
    messageId: String(message.id),
    status: "pending" as const,
    errorMessage: null,
    rawContent: writeTelegramImportContent({
      source: "telegram-desktop-export",
      channelName: channelName ?? null,
      messageId: message.id,
      summary,
      text,
      caption: message.caption ?? null,
      postedAt: message.date ?? null,
      postedAtUnix: message.date_unixtime ?? null,
      mediaType: message.media_type ?? null,
      mimeType: message.mime_type ?? null,
      file: message.file ?? null,
      fileName: message.file_name ?? null,
      thumbnail: message.thumbnail ?? null,
      groupedId: message.grouped_id ?? null,
      durationSeconds: message.duration_seconds ?? null,
      mediaRefs: mediaRefs.map((entry) => normalizeTelegramRelativePath(entry))
    })
  };
}

export function parseTelegramHistoryExport(input: unknown) {
  const parsed = telegramExportSchema.parse(input);

  const records = parsed.messages
    .filter((message) => message.type !== "service")
    .map((message) => buildImportRecord(message, parsed.name));

  return {
    channelName: parsed.name ?? null,
    records
  };
}
