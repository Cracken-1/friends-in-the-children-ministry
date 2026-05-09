import type { BibleStudy } from "@/generated/prisma/client";
import type { Route } from "next";
import { ArrowRight, BookMarked, FileText, GraduationCap, Star } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/public/page-hero";
import { db, isDatabaseConfigured } from "@/server/db/client";

const studyFormats = [
  {
    title: "Student Worksheets",
    body: "Printable guides that help learners follow the study and reflect personally.",
    icon: FileText
  },
  {
    title: "Teacher Guides",
    body: "Facilitator notes and structure for leading the study with confidence.",
    icon: GraduationCap
  },
  {
    title: "Comprehensive Studies",
    body: "Longer-form Bible study material for deeper classroom or group use.",
    icon: BookMarked
  }
] as const;

export const revalidate = 60;

const fallbackStudies = [
  {
    id: "study-faith-pressure",
    title: "Faith Under Pressure",
    summary: "A reflective study designed for older children and preteens learning how faith holds up under pressure.",
    featured: true
  },
  {
    id: "study-walking-jesus",
    title: "Walking with Jesus",
    summary: "A teacher-guided Bible study with student prompts, personal reflection, and class conversation rhythm.",
    featured: false
  }
] satisfies Array<Pick<BibleStudy, "id" | "title" | "summary" | "featured">>;

export default async function BibleStudyPage() {
  const studies: Array<Pick<BibleStudy, "id" | "title" | "summary" | "featured">> = isDatabaseConfigured
    ? await db.bibleStudy.findMany({
        where: { status: "published" },
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
        take: 12
      })
    : fallbackStudies;

  return (
    <div className="bg-sky-50">
      <PageHero
        eyebrow="Bible Study"
        title="Bible study guides for teachers and learners."
        description="Built around the old blueprint, but with a more welcoming structure: featured studies, teacher guides, student worksheets, and room for printable companion material."
        badges={[
          { icon: <BookMarked size={16} />, label: `${studies.length} study guides` },
          { icon: <GraduationCap size={16} />, label: "Teacher and student formats" }
        ]}
      />
      <section className="page-shell py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {studyFormats.map((format) => (
            <article key={format.title} className="rounded-[16px] bg-white p-6 text-center legacy-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white">
                <format.icon size={28} />
              </div>
              <h2 className="mt-5 text-2xl font-semibold">{format.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{format.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[16px] bg-white p-8 legacy-shadow">
            <h2 className="text-2xl font-semibold text-blue-900">Featured and recent studies</h2>
            <div className="mt-6 grid gap-4">
              {studies.map((study) => (
                <article key={study.id} className="rounded-[16px] border border-border bg-sky-50 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {study.featured ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-3 py-1 text-amber-900">
                        <Star size={13} />
                        Featured
                      </span>
                    ) : null}
                    <span>Study guide</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">{study.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {study.summary || "Bible study notes and guide details will appear here once connected."}
                  </p>
                  <Link
                    href={`/bible-study/${study.id}` as Route}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-800"
                  >
                    Open study
                    <ArrowRight size={15} />
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[16px] bg-white p-8 legacy-shadow">
            <h2 className="text-2xl font-semibold text-blue-900">How these studies are used</h2>
            <div className="mt-6 grid gap-4 text-sm leading-7 text-muted-foreground">
              <p>1. Teachers prepare with a structured guide and a clear session flow.</p>
              <p>2. Students receive printable prompts or worksheet material matched to the lesson.</p>
              <p>3. Families can continue the conversation at home with simple follow-up cues.</p>
            </div>
            <Link
              href="/resources"
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-blue-800 px-4 py-3 text-sm font-semibold text-blue-800"
            >
              Explore companion resources
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
