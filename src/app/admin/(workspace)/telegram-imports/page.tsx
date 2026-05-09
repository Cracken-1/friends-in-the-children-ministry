import type { TelegramImport } from "@/generated/prisma/client";
import { AlertTriangle, Bot, CheckCircle2, RefreshCw, ShieldCheck, Webhook } from "lucide-react";
import Link from "next/link";

import { TelegramHistoryImporter } from "@/components/admin/telegram-history-importer";
import { TelegramMediaImporter } from "@/components/admin/telegram-media-importer";
import { AdminListFeedback } from "@/components/admin/admin-action-feedback";
import { AdminEmptyState, AdminKpiCard, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { bulkPromoteTelegramImportsAction } from "@/server/admin/telegram-actions";
import { adminTelegramFallback } from "@/server/admin/mock-data";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { getUploadStorageMode } from "@/server/services/uploads";
import { readTelegramImportContent } from "@/server/services/telegram-import-content";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTelegramImportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const storageMode = getUploadStorageMode();
  const imports: Array<
    Pick<TelegramImport, "id" | "messageId" | "status" | "createdAt" | "rawContent" | "mappedLessonId">
  > | typeof adminTelegramFallback.imports = isDatabaseConfigured
    ? await db.telegramImport.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          messageId: true,
          status: true,
          createdAt: true,
          rawContent: true,
          mappedLessonId: true
        }
      })
    : adminTelegramFallback.imports;

  const counts = {
    total: imports.length,
    queued: imports.filter((item) => item.status === "queued").length,
    pending: imports.filter((item) => item.status === "pending").length,
    processing: imports.filter((item) => item.status === "processing").length,
    completed: imports.filter((item) => item.status === "completed").length,
    failed: imports.filter((item) => item.status === "failed").length
  };

  return (
    <div className="space-y-8">
      <AdminListFeedback entityLabel="Telegram import" success={params.success} error={params.error} />
      <AdminPageHeader
        eyebrow="Integrations"
        title="Telegram Imports"
        description="Review incoming Telegram items, queue state, and import processing activity."
        meta={
          <>
            <span className="rounded-full bg-slate-100 px-3 py-2">Mode: {adminTelegramFallback.mode}</span>
            <span className="rounded-full bg-slate-100 px-3 py-2">Queue health: monitored</span>
          </>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AdminKpiCard label="Total imports" value={counts.total} icon={<Bot size={24} />} tone="dark" />
        <AdminKpiCard label="Completed" value={counts.completed} icon={<ShieldCheck size={24} />} tone="green" />
        <AdminKpiCard label="Needs review" value={counts.failed + counts.pending} icon={<AlertTriangle size={24} />} tone="amber" />
      </div>

      <AdminPanel
        title="Historical import"
        description="Use a Telegram Desktop export to stage older channel lessons before the bot starts ingesting only new posts."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <TelegramHistoryImporter />
          <TelegramMediaImporter storageMode={storageMode} />
        </div>
      </AdminPanel>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminPanel title="Import queue" description="Recent Telegram items and their current processing status.">
          {imports.length ? (
            <form action={bulkPromoteTelegramImportsAction} className="grid gap-4">
              <div className="flex flex-col gap-3 rounded-[16px] border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Bulk promotion</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Select reviewed imports and promote them into lesson drafts in one pass.
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="grid gap-2 text-sm font-medium text-slate-700">
                    <span>Lesson status</span>
                    <select
                      name="status"
                      defaultValue="draft"
                      className="h-11 rounded-md border border-slate-300 px-3 font-normal text-slate-900"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
                  >
                    Promote selected
                  </button>
                </div>
              </div>
              <div className="grid gap-4">
              {imports.map((item) => {
                const content =
                  "rawContent" in item ? readTelegramImportContent(item.rawContent) : {};
                const mediaCount = content.mediaAssets?.length ?? 0;
                const mappedLessonId =
                  "mappedLessonId" in item && typeof item.mappedLessonId === "string"
                    ? item.mappedLessonId
                    : null;
                const isMapped = Boolean(mappedLessonId);
                const selectable = !isMapped && item.status !== "completed";

                return (
                  <article key={item.id} className="rounded-[16px] border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-blue-700">
                          {selectable ? (
                            <label className="inline-flex items-center gap-2 text-slate-700">
                              <input
                                type="checkbox"
                                name="selectedImportId"
                                value={item.id}
                                className="h-4 w-4 rounded border-slate-300 text-blue-700"
                              />
                              <span>Select</span>
                            </label>
                          ) : null}
                          <span>Message {item.messageId}</span>
                          {content.mediaType ? <span>{content.mediaType}</span> : null}
                          {content.source ? <span>{String(content.source)}</span> : null}
                          {mediaCount ? <span>{mediaCount} media</span> : null}
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">
                          <Link href={`/admin/telegram-imports/${item.id}` as any} className="hover:text-blue-700">
                            {content.summary || "Telegram content awaiting migration"}
                          </Link>
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {typeof item.createdAt === "string" ? item.createdAt : "Recently received"}
                        </p>
                        {content.file && !mediaCount ? (
                          <p className="mt-2 text-xs font-medium text-amber-700">
                            Awaiting companion media for {content.file}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-3 lg:items-end">
                        <span
                          className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                            item.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : item.status === "failed"
                                ? "bg-rose-100 text-rose-700"
                                : item.status === "processing"
                                  ? "bg-sky-100 text-sky-700"
                                  : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.status}
                        </span>
                        {isMapped && mappedLessonId ? (
                          <Link
                            href={`/admin/lessons/${mappedLessonId}/edit` as any}
                            className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
                          >
                            <CheckCircle2 size={15} />
                            Open lesson
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/telegram-imports/${item.id}` as any}
                            className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
                          >
                            Review
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
              </div>
            </form>
          ) : (
            <AdminEmptyState
              title="No imports yet"
              body="When Telegram content starts arriving, the raw imports and their processing state will show here."
            />
          )}
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title="Operational guidance" description="Recommended operating model for stable Telegram ingestion.">
            <div className="grid gap-3">
              {[
                { icon: <Webhook size={18} />, text: "Webhook mode should be the long-term default for real-time ingestion." },
                { icon: <RefreshCw size={18} />, text: "Polling mode is still useful for controlled manual recovery and historic cleanup." },
                { icon: <ShieldCheck size={18} />, text: "Secret-token validation belongs in the webhook route before any payload is accepted." }
              ].map((item) => (
                <div key={item.text} className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="mt-0.5 text-blue-700">{item.icon}</div>
                  <p className="leading-7">{item.text}</p>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title="Queue snapshot" description="Status totals for the current Telegram processing queue.">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Queued", counts.queued],
                ["Pending", counts.pending],
                ["Processing", counts.processing],
                ["Failed", counts.failed]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-semibold text-slate-900">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
