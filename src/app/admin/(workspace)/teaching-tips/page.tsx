import type { TeachingTip } from "@/generated/prisma/client";
import type { Route } from "next";
import { Lightbulb, Plus } from "lucide-react";
import Link from "next/link";

import { AdminListFeedback } from "@/components/admin/admin-action-feedback";
import { AdminEmptyState, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { db, isDatabaseConfigured } from "@/server/db/client";

const fallbackTips = [
  {
    id: "tip-1",
    title: "Keep activities shorter than you think",
    content: "Young learners often respond better when we end a touch earlier than the perfect adult timetable suggests.",
    status: "published"
  },
  {
    id: "tip-2",
    title: "Give parents one follow-up question",
    content: "One simple take-home prompt can make the lesson feel alive after Sunday is over.",
    status: "draft"
  }
] as const;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTeachingTipsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tips: Array<Pick<TeachingTip, "id" | "title" | "content" | "status">> | typeof fallbackTips =
    isDatabaseConfigured
      ? await db.teachingTip.findMany({ orderBy: { updatedAt: "desc" }, take: 50 })
      : fallbackTips;

  return (
    <div className="space-y-8">
      <AdminListFeedback entityLabel="Teaching tip" success={params.success} error={params.error} />
      <AdminPageHeader
        eyebrow="Editorial Support"
        title="Teaching Tips"
        description="This section preserves the teacher-friendly human tone of the ministry. Now it also has the structure to become a working editorial area."
        actions={
          <Link href={"/admin/teaching-tips/new" as any} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            <Plus size={16} />
            New teaching tip
          </Link>
        }
      />

      <AdminPanel title="Teaching tip library" description="Short, practical content that supports teachers before and after the lesson itself.">
        {tips.length ? (
          <div className="grid gap-4">
            {tips.map((tip) => (
              <article key={tip.id} className="rounded-[16px] border border-slate-200 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      <Lightbulb size={14} />
                      Teaching support
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{tip.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{tip.content}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                        tip.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {tip.status}
                    </span>
                    <Link href={`/admin/teaching-tips/${tip.id}/edit` as any} className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                      Edit
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No teaching tips yet"
            body="Add the first teaching tip and this space will become part of the ministry's editorial support library."
          />
        )}
      </AdminPanel>
    </div>
  );
}
