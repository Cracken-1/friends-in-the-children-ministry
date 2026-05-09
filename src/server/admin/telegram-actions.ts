"use server";

import type { ContentStatus, TelegramImport } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import slugify from "slugify";

import { writeAdminAuditLog } from "@/server/admin/audit-log";
import { requireAdminSession } from "@/server/auth/session";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { readTelegramImportContent } from "@/server/services/telegram-import-content";

function buildSlug(title: string) {
  const base = slugify(title, { lower: true, strict: true }) || "telegram-lesson";
  return `${base}-${Date.now().toString(36)}`;
}

function buildLessonTitle(content: ReturnType<typeof readTelegramImportContent>, fallbackId: string) {
  const source = content.summary || content.caption || content.text || `Telegram lesson ${fallbackId}`;
  return source.trim().slice(0, 120);
}

function buildLessonSummary(content: ReturnType<typeof readTelegramImportContent>) {
  const source = content.summary || content.caption || content.text || "";
  return source.trim().slice(0, 280) || null;
}

function buildLessonBody(
  primary: ReturnType<typeof readTelegramImportContent>,
  related: Array<ReturnType<typeof readTelegramImportContent>>
) {
  const blocks: string[] = [];

  const mainText = primary.text?.trim() || primary.caption?.trim() || primary.summary?.trim();
  if (mainText) {
    blocks.push(mainText);
  }

  const attachmentLines = related.flatMap((entry) =>
    (entry.mediaAssets ?? []).map((asset) => `- ${asset.fileName} (${asset.mimeType})`)
  );

  if (attachmentLines.length) {
    blocks.push(["Attached media", ...attachmentLines].join("\n"));
  }

  return blocks.join("\n\n").trim() || "Imported from Telegram. Add the lesson body here.";
}

function readLessonStatus(value: FormDataEntryValue | null): ContentStatus {
  return value === "published" || value === "archived" ? value : "draft";
}

async function getRelatedImports(targetImport: {
  id: string;
  messageId: string;
  rawContent: unknown;
}) {
  const primaryContent = readTelegramImportContent(targetImport.rawContent);
  const groupedId = primaryContent.groupedId == null ? null : String(primaryContent.groupedId);

  const relatedImports: Array<{ id: string; messageId: string; rawContent: unknown }> = groupedId
    ? (
        await db.telegramImport.findMany({
          where: {
            mappedLessonId: null
          },
          select: {
            id: true,
            messageId: true,
            rawContent: true
          }
        })
      ).filter((item) => {
        const content = readTelegramImportContent(item.rawContent);
        return String(content.groupedId ?? "") === groupedId;
      })
    : [
        {
          id: targetImport.id,
          messageId: targetImport.messageId,
          rawContent: targetImport.rawContent
        }
      ];

  return { primaryContent, relatedImports };
}

async function promoteTelegramImportToLesson(id: string, status: ContentStatus) {
  const targetImport = await db.telegramImport.findUnique({
    where: { id },
    select: {
      id: true,
      messageId: true,
      rawContent: true,
      mappedLessonId: true
    }
  });

  if (!targetImport || targetImport.mappedLessonId) {
    return null;
  }

  const { primaryContent, relatedImports } = await getRelatedImports(targetImport);
  const contents = relatedImports.map((item) => readTelegramImportContent(item.rawContent));
  const lessonTitle = buildLessonTitle(primaryContent, targetImport.messageId);

  const lesson = await db.lesson.create({
    data: {
      title: lessonTitle,
      slug: buildSlug(lessonTitle),
      summary: buildLessonSummary(primaryContent),
      content: buildLessonBody(primaryContent, contents),
      ageGroup: "General",
      className: null,
      duration: primaryContent.durationSeconds ? Math.ceil(primaryContent.durationSeconds / 60) : null,
      difficulty: null,
      status,
      publishedAt: status === "published" ? new Date() : null
    }
  });

  const attachmentData = contents.flatMap((entry) =>
    (entry.mediaAssets ?? []).map((asset) => ({
      lessonId: lesson.id,
      filename: asset.fileName,
      url: asset.url,
      size: asset.size,
      mimeType: asset.mimeType
    }))
  );

  if (attachmentData.length) {
    await db.lessonAttachment.createMany({
      data: attachmentData,
      skipDuplicates: false
    });
  }

  await db.telegramImport.updateMany({
    where: {
      id: {
        in: relatedImports.map((item) => item.id)
      }
    },
    data: {
      status: "completed",
      mappedLessonId: lesson.id,
      errorMessage: null
    }
  });

  await writeAdminAuditLog({
    action: "create",
    entityType: "telegram_lesson_promotion",
    entityId: lesson.id,
    metadata: {
      sourceImportId: id,
      relatedImportCount: relatedImports.length,
      attachmentCount: attachmentData.length,
      lessonTitle,
      lessonStatus: status
    }
  });

  return {
    lessonId: lesson.id,
    attachmentCount: attachmentData.length
  };
}

export async function promoteTelegramImportToLessonAction(id: string, formData: FormData) {
  await requireAdminSession();

  if (!isDatabaseConfigured) {
    redirect("/admin/telegram-imports?error=database-not-configured" as any);
  }

  const promoted = await promoteTelegramImportToLesson(id, readLessonStatus(formData.get("status")));

  if (!promoted) {
    redirect("/admin/telegram-imports?error=telegram-import-already-mapped" as any);
  }

  redirect("/admin/telegram-imports?success=promoted" as any);
}

export async function bulkPromoteTelegramImportsAction(formData: FormData) {
  await requireAdminSession();

  if (!isDatabaseConfigured) {
    redirect("/admin/telegram-imports?error=database-not-configured" as any);
  }

  const selectedIds = formData
    .getAll("selectedImportId")
    .filter((value): value is string => typeof value === "string" && value.length > 0);

  if (!selectedIds.length) {
    redirect("/admin/telegram-imports?error=telegram-import-selection-required" as any);
  }

  const status = readLessonStatus(formData.get("status"));
  const promotedLessonIds = new Set<string>();

  for (const id of selectedIds) {
    const promoted = await promoteTelegramImportToLesson(id, status);
    if (promoted) {
      promotedLessonIds.add(promoted.lessonId);
    }
  }

  if (!promotedLessonIds.size) {
    redirect("/admin/telegram-imports?error=telegram-import-already-mapped" as any);
  }

  await writeAdminAuditLog({
    action: "create",
    entityType: "telegram_bulk_promotion",
    metadata: {
      selectedCount: selectedIds.length,
      promotedCount: promotedLessonIds.size,
      lessonStatus: status
    }
  });

  redirect("/admin/telegram-imports?success=bulk-promoted" as any);
}
