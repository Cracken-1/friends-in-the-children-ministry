import type { TelegramImport } from "@/generated/prisma/client";
import { CheckCircle2, ExternalLink, FileAudio, FileImage, FileText, FileVideo, Link2, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { AdminActionCard, AdminEmptyState, AdminNotice, AdminPanel } from "@/components/admin/admin-ui";
import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { FormActions, SelectField } from "@/components/admin/content-form";
import { promoteTelegramImportToLessonAction } from "@/server/admin/telegram-actions";
import { requireAdminSession } from "@/server/auth/session";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { readTelegramImportContent } from "@/server/services/telegram-import-content";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function inferAttachmentIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <FileImage size={18} />;
  if (mimeType.startsWith("video/")) return <FileVideo size={18} />;
  if (mimeType.startsWith("audio/")) return <FileAudio size={18} />;
  return <FileText size={18} />;
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (value >= 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${value} B`;
}

export default async function TelegramImportReviewPage({ params, searchParams }: PageProps) {
  await requireAdminSession();
  const { id } = await params;
  const query = await searchParams;

  if (!isDatabaseConfigured) {
    notFound();
  }

  const importItem = await db.telegramImport.findUnique({
    where: { id },
    select: {
      id: true,
      messageId: true,
      status: true,
      createdAt: true,
      mappedLessonId: true,
      rawContent: true
    }
  });

  if (!importItem) {
    notFound();
  }

  const content = readTelegramImportContent(importItem.rawContent);
  const groupId = content.groupedId == null ? null : String(content.groupedId);

  const groupedImports: Array<
    Pick<TelegramImport, "id" | "messageId" | "status" | "rawContent">
  > = (
    await db.telegramImport.findMany({
      select: {
        id: true,
        messageId: true,
        status: true,
        rawContent: true
      },
      orderBy: { createdAt: "asc" }
    })
  ).filter((entry) => {
    const entryContent = readTelegramImportContent(entry.rawContent);
    return groupId ? String(entryContent.groupedId ?? "") === groupId : entry.id === importItem.id;
  });

  const relatedContents = groupedImports.map((entry) => ({
    id: entry.id,
    messageId: entry.messageId,
    status: entry.status,
    content: readTelegramImportContent(entry.rawContent)
  }));

  const mediaAssets = relatedContents.flatMap((entry) =>
    (entry.content.mediaAssets ?? []).map((asset) => ({
      sourceImportId: entry.id,
      sourceMessageId: entry.messageId,
      ...asset
    }))
  );

  return (
    <ContentEditorShell
      title={`Telegram Import ${importItem.messageId}`}
      description="Review staged Telegram lesson content, confirm media pairing, and promote it into a lesson draft when it is ready."
      backHref="/admin/telegram-imports"
    >
      <div className="space-y-8">
        <AdminEditorFeedback entityLabel="Telegram import" success={query.success} error={query.error} />

        {importItem.mappedLessonId ? (
          <AdminNotice
            tone="success"
            title="Already promoted"
            body="This Telegram import is already mapped to a lesson. You can open that lesson for further editing."
            action={
              <Link
                href={`/admin/lessons/${importItem.mappedLessonId}/edit` as any}
                className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                <CheckCircle2 size={15} />
                Open lesson
              </Link>
            }
          />
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <AdminPanel
              title="Content review"
              description="Source text and caption content staged from Telegram before promotion."
            >
              <div className="grid gap-4">
                <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    <MessageSquareText size={15} />
                    Source summary
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {content.summary || "No summary was detected for this Telegram import."}
                  </p>
                </div>
                <div className="rounded-[16px] border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">Captured lesson text</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {content.text || content.caption || "No text content was captured for this import."}
                  </p>
                </div>
              </div>
            </AdminPanel>

            <AdminPanel
              title="Grouped Telegram items"
              description="Items that share the same Telegram grouped identifier and will be promoted together."
            >
              {relatedContents.length ? (
                <div className="grid gap-4">
                  {relatedContents.map((entry) => (
                    <article key={entry.id} className="rounded-[16px] border border-slate-200 p-4">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                        <span>Message {entry.messageId}</span>
                        {entry.content.mediaType ? <span>{entry.content.mediaType}</span> : null}
                        <span>{entry.status}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        {entry.content.summary || entry.content.caption || entry.content.text || "No text captured."}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <AdminEmptyState
                  title="No grouped items"
                  body="Only this Telegram entry is currently in the promotion group."
                />
              )}
            </AdminPanel>
          </div>

          <div className="space-y-6">
            <AdminPanel
              title="Attachment review"
              description="Matched media files that will become lesson attachments after promotion."
            >
              {mediaAssets.length ? (
                <div className="grid gap-3">
                  {mediaAssets.map((asset) => (
                    <article key={`${asset.sourceImportId}-${asset.relativePath}`} className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white p-2 text-slate-700">
                          {inferAttachmentIcon(asset.mimeType)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{asset.fileName}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {asset.mimeType} · {formatBytes(asset.size)} · Message {asset.sourceMessageId}
                          </p>
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-700"
                          >
                            <ExternalLink size={14} />
                            Open stored file
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <AdminEmptyState
                  title="No matched attachments yet"
                  body="Import the Telegram media folder first if this lesson should include videos, audio, images, or documents."
                />
              )}
            </AdminPanel>

            <AdminActionCard
              title="Promote to lesson"
              body="Promotion creates a draft lesson, copies matched media into lesson attachments, and marks the related Telegram imports as completed."
              icon={<Link2 size={18} />}
              action={
                importItem.mappedLessonId ? (
                  <Link
                    href={`/admin/lessons/${importItem.mappedLessonId}/edit` as any}
                    className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900"
                  >
                    Open lesson
                  </Link>
                ) : (
                  <form action={promoteTelegramImportToLessonAction.bind(null, importItem.id)} className="grid gap-4">
                    <SelectField
                      label="Initial lesson status"
                      name="status"
                      defaultValue="draft"
                      options={[
                        { label: "Draft", value: "draft" },
                        { label: "Published", value: "published" },
                        { label: "Archived", value: "archived" }
                      ]}
                    />
                    <FormActions submitLabel="Promote to lesson" />
                  </form>
                )
              }
            />
          </div>
        </div>
      </div>
    </ContentEditorShell>
  );
}
