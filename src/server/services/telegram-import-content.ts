import "server-only";

import type { Prisma } from "@/generated/prisma/client";

export type TelegramMediaAsset = {
  kind: "primary" | "thumbnail";
  relativePath: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export type TelegramImportContent = {
  source?: string | null;
  channelName?: string | null;
  messageId?: number | string | null;
  summary?: string | null;
  text?: string | null;
  caption?: string | null;
  postedAt?: string | null;
  postedAtUnix?: string | null;
  mediaType?: string | null;
  mimeType?: string | null;
  file?: string | null;
  fileName?: string | null;
  thumbnail?: string | null;
  groupedId?: string | number | null;
  durationSeconds?: number | null;
  mediaRefs?: string[];
  mediaAssets?: TelegramMediaAsset[];
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
};

export function normalizeTelegramRelativePath(value: string) {
  return value.replaceAll("\\", "/").replace(/^\.?\//, "").trim().toLowerCase();
}

export function readTelegramImportContent(rawContent: unknown): TelegramImportContent {
  if (!rawContent || typeof rawContent !== "object" || Array.isArray(rawContent)) {
    return {};
  }

  const source = rawContent as Record<string, unknown>;
  const mediaAssets = Array.isArray(source.mediaAssets)
    ? source.mediaAssets
        .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object"))
        .map((entry) => ({
          kind: (entry.kind === "thumbnail" ? "thumbnail" : "primary") as
            | "primary"
            | "thumbnail",
          relativePath: typeof entry.relativePath === "string" ? entry.relativePath : "",
          url: typeof entry.url === "string" ? entry.url : "",
          fileName: typeof entry.fileName === "string" ? entry.fileName : "",
          mimeType: typeof entry.mimeType === "string" ? entry.mimeType : "application/octet-stream",
          size: typeof entry.size === "number" ? entry.size : 0
        }))
        .filter((entry) => entry.relativePath && entry.url)
    : [];

  return {
    source: typeof source.source === "string" ? source.source : null,
    channelName: typeof source.channelName === "string" ? source.channelName : null,
    messageId:
      typeof source.messageId === "number" || typeof source.messageId === "string"
        ? source.messageId
        : null,
    summary: typeof source.summary === "string" ? source.summary : null,
    text: typeof source.text === "string" ? source.text : null,
    caption: typeof source.caption === "string" ? source.caption : null,
    postedAt: typeof source.postedAt === "string" ? source.postedAt : null,
    postedAtUnix: typeof source.postedAtUnix === "string" ? source.postedAtUnix : null,
    mediaType: typeof source.mediaType === "string" ? source.mediaType : null,
    mimeType: typeof source.mimeType === "string" ? source.mimeType : null,
    file: typeof source.file === "string" ? source.file : null,
    fileName: typeof source.fileName === "string" ? source.fileName : null,
    thumbnail: typeof source.thumbnail === "string" ? source.thumbnail : null,
    groupedId:
      typeof source.groupedId === "string" || typeof source.groupedId === "number"
        ? source.groupedId
        : null,
    durationSeconds: typeof source.durationSeconds === "number" ? source.durationSeconds : null,
    mediaRefs: Array.isArray(source.mediaRefs)
      ? source.mediaRefs.filter((entry): entry is string => typeof entry === "string")
      : [],
    mediaAssets,
    fileUrl: typeof source.fileUrl === "string" ? source.fileUrl : null,
    thumbnailUrl: typeof source.thumbnailUrl === "string" ? source.thumbnailUrl : null
  };
}

export function writeTelegramImportContent(
  content: TelegramImportContent
): Prisma.InputJsonValue {
  return {
    source: content.source ?? null,
    channelName: content.channelName ?? null,
    messageId: content.messageId ?? null,
    summary: content.summary ?? null,
    text: content.text ?? null,
    caption: content.caption ?? null,
    postedAt: content.postedAt ?? null,
    postedAtUnix: content.postedAtUnix ?? null,
    mediaType: content.mediaType ?? null,
    mimeType: content.mimeType ?? null,
    file: content.file ?? null,
    fileName: content.fileName ?? null,
    thumbnail: content.thumbnail ?? null,
    groupedId: content.groupedId ?? null,
    durationSeconds: content.durationSeconds ?? null,
    mediaRefs: content.mediaRefs ?? [],
    mediaAssets: (content.mediaAssets ?? []).map((entry) => ({
      kind: entry.kind,
      relativePath: entry.relativePath,
      url: entry.url,
      fileName: entry.fileName,
      mimeType: entry.mimeType,
      size: entry.size
    })),
    fileUrl: content.fileUrl ?? null,
    thumbnailUrl: content.thumbnailUrl ?? null
  } satisfies Prisma.InputJsonValue;
}
