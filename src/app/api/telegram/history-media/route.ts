import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAdminAuditLog } from "@/server/admin/audit-log";
import { requireSystemAdminSession } from "@/server/auth/session";
import { db, isDatabaseConfigured } from "@/server/db/client";
import {
  normalizeTelegramRelativePath,
  readTelegramImportContent,
  writeTelegramImportContent
} from "@/server/services/telegram-import-content";

const mediaManifestSchema = z.object({
  entries: z
    .array(
      z.object({
        relativePath: z.string().min(1),
        url: z.string().url(),
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
        size: z.number().int().nonnegative()
      })
    )
    .min(1)
});

export async function POST(request: Request) {
  let session;
  try {
    session = await requireSystemAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const parsed = mediaManifestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Media manifest is invalid." }, { status: 400 });
  }

  const manifestEntries = parsed.data.entries.map((entry) => ({
    ...entry,
    normalizedPath: normalizeTelegramRelativePath(entry.relativePath)
  }));

  const imports = await db.telegramImport.findMany({
    where: {
      mappedLessonId: null
    },
    select: {
      id: true,
      messageId: true,
      rawContent: true,
      status: true
    },
    orderBy: { createdAt: "desc" },
    take: 3000
  });

  let matchedImports = 0;
  let matchedFiles = 0;
  const updates: Array<{ id: string; rawContent: ReturnType<typeof writeTelegramImportContent> }> = [];

  for (const item of imports) {
    const content = readTelegramImportContent(item.rawContent);
    const currentAssets = [...(content.mediaAssets ?? [])];
    let touched = false;

    const refs = [
      content.file
        ? { path: normalizeTelegramRelativePath(content.file), kind: "primary" as const }
        : null,
      content.thumbnail
        ? { path: normalizeTelegramRelativePath(content.thumbnail), kind: "thumbnail" as const }
        : null
    ].filter(Boolean) as Array<{ path: string; kind: "primary" | "thumbnail" }>;

    for (const ref of refs) {
      const match = manifestEntries.find(
        (entry) =>
          entry.normalizedPath === ref.path || entry.normalizedPath.endsWith(`/${ref.path}`)
      );

      if (!match) {
        continue;
      }

      const alreadyPresent = currentAssets.some(
        (asset) => asset.relativePath === ref.path && asset.url === match.url
      );

      if (!alreadyPresent) {
        currentAssets.push({
          kind: ref.kind,
          relativePath: ref.path,
          url: match.url,
          fileName: match.fileName,
          mimeType: match.mimeType,
          size: match.size
        });
        matchedFiles += 1;
      }

      if (ref.kind === "primary") {
        content.fileUrl = match.url;
      }

      if (ref.kind === "thumbnail") {
        content.thumbnailUrl = match.url;
      }

      touched = true;
    }

    if (!touched) {
      continue;
    }

    content.mediaAssets = currentAssets;
    updates.push({
      id: item.id,
      rawContent: writeTelegramImportContent(content)
    });
    matchedImports += 1;
  }

  await db.$transaction(
    updates.map((entry) =>
      db.telegramImport.update({
        where: { id: entry.id },
        data: {
          rawContent: entry.rawContent,
          status: "pending",
          errorMessage: null
        }
      })
    )
  );

  await writeAdminAuditLog({
    action: "update",
    entityType: "telegram_media_import",
    metadata: {
      actorEmail: session.email,
      uploadedFiles: manifestEntries.length,
      matchedImports,
      matchedFiles
    }
  });

  return NextResponse.json(
    {
      ok: true,
      uploadedFiles: manifestEntries.length,
      matchedImports,
      matchedFiles
    },
    { status: 200 }
  );
}
