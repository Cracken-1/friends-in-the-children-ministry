import type { Lesson } from "@/generated/prisma/client";
import type { Route } from "next";
import { Clock3, Plus, Search } from "lucide-react";
import Link from "next/link";

import { AdminListFeedback } from "@/components/admin/admin-action-feedback";
import { AdminEmptyState, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { adminFallbackLessons } from "@/server/admin/mock-data";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLessonsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const lessons: Array<
    Pick<Lesson, "id" | "title" | "ageGroup" | "status" | "duration" | "updatedAt">
  > | typeof adminFallbackLessons = isDatabaseConfigured
    ? await db.lesson.findMany({ orderBy: { updatedAt: "desc" }, take: 50 })
    : adminFallbackLessons;

  return (
    <div className="space-y-8">
      <AdminListFeedback entityLabel="Lesson" success={params.success} error={params.error} />
      <AdminPageHeader
        eyebrow="Content Management"
        title="Lessons"
        description="Manage lesson content, publish state, and classroom readiness. This page now follows the old portal's practical management style instead of a bare list."
        actions={
          <Link href={"/admin/lessons/new" as any} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            <Plus size={16} />
            New lesson
          </Link>
        }
      />

      <AdminPanel
        title="Lesson Library"
        description="Published, draft, and age-group coverage at a glance."
        actions={
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            <Search size={15} />
            Search and filters will connect to live queries next
          </div>
        }
      >
        {lessons.length ? (
          <div className="grid gap-4">
            {lessons.map((lesson) => (
              <article
                key={lesson.id}
                className="grid gap-4 rounded-[16px] border border-slate-200 p-5 lg:grid-cols-[1.2fr_0.6fr_0.4fr]"
              >
                <div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    <span>{lesson.ageGroup}</span>
                    {"views" in lesson ? <span>{lesson.views} views</span> : null}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{lesson.title}</h3>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                    {"duration" in lesson && lesson.duration ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={14} />
                        {lesson.duration} min
                      </span>
                    ) : null}
                    {"updatedAt" in lesson ? <span>Recently updated</span> : <span>Fallback content snapshot</span>}
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                      lesson.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {lesson.status}
                  </span>
                </div>
                <div className="flex items-center justify-start lg:justify-end">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/lessons/${lesson.id}/edit` as any} className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                      Edit
                    </Link>
                    <Link href="/lessons" className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                      View public page
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No lessons yet"
            body="As soon as the first lesson records are created, they will show up here with publish state, age-group context, and lesson management actions."
          />
        )}
      </AdminPanel>
    </div>
  );
}
