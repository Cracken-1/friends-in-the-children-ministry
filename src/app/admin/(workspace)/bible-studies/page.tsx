import type { BibleStudy } from "@/generated/prisma/client";
import type { Route } from "next";
import { BookMarked, FileDown, Star } from "lucide-react";
import Link from "next/link";

import { AdminListFeedback } from "@/components/admin/admin-action-feedback";
import { AdminEmptyState, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { adminFallbackBibleStudies } from "@/server/admin/mock-data";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBibleStudiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const studies: Array<
    Pick<BibleStudy, "id" | "title" | "featured" | "status">
  > | typeof adminFallbackBibleStudies = isDatabaseConfigured
    ? await db.bibleStudy.findMany({ orderBy: { updatedAt: "desc" }, take: 50 })
    : adminFallbackBibleStudies;

  return (
    <div className="space-y-8">
      <AdminListFeedback entityLabel="Bible study" success={params.success} error={params.error} />
      <AdminPageHeader
        eyebrow="Content Management"
        title="Bible Studies"
        description="This area is now framed around the actual ministry workflow: featured studies, teacher guides, and printable student material."
        actions={
          <Link href={"/admin/bible-studies/new" as any} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            New study
          </Link>
        }
      />

      <AdminPanel title="Study Library" description="Featured status and delivery format are surfaced so the team can manage depth-oriented content with less guesswork.">
        {studies.length ? (
          <div className="grid gap-4">
            {studies.map((study) => (
              <article key={study.id} className="rounded-[16px] border border-slate-200 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      {study.featured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-2 text-amber-700">
                          <Star size={14} />
                          Featured
                        </span>
                      ) : null}
                      {"format" in study ? <span>{study.format}</span> : <span>Study content</span>}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{study.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                        study.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {study.status}
                    </span>
                    <Link href={`/admin/bible-studies/${study.id}/edit` as any} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                      <FileDown size={15} />
                      Edit study
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No Bible studies yet"
            body="Create Bible study material here and the platform will eventually connect student worksheets, teacher guides, and custom PDF exports from the same records."
          />
        )}
      </AdminPanel>

      <div className="grid gap-5 lg:grid-cols-3">
        {[
          { label: "Teacher guides", value: "Structured for facilitated teaching", icon: <BookMarked size={20} /> },
          { label: "Student worksheets", value: "Printable take-home support", icon: <FileDown size={20} /> },
          { label: "Featured studies", value: "Highlight flagship material", icon: <Star size={20} /> }
        ].map((item) => (
          <article key={item.label} className="rounded-[16px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              {item.icon}
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{item.label}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">{item.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
