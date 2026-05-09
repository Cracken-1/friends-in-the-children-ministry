import type { Lesson } from "@/generated/prisma/client";
import type { Route } from "next";
import { ArrowRight, BookOpen, Clock3, PlayCircle, Search, Sparkles, Users } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/public/page-hero";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const revalidate = 60;

const fallbackLessons = [
  {
    id: "fallback-david-goliath",
    title: "David and Goliath",
    summary: "A courage-filled lesson plan with discussion prompts, memory verse, and activity ideas.",
    ageGroup: "Ages 7-10",
    duration: 35
  },
  {
    id: "fallback-creation",
    title: "Creation and God's Good World",
    summary: "A creation lesson designed for younger learners with simple visual storytelling moments.",
    ageGroup: "Ages 3-6",
    duration: 25
  },
  {
    id: "fallback-good-samaritan",
    title: "The Good Samaritan",
    summary: "A practical compassion lesson with role-play ideas and reflective questions.",
    ageGroup: "Ages 10-12",
    duration: 40
  },
  {
    id: "fallback-feeding-5000",
    title: "Feeding the Five Thousand",
    summary: "A multimedia-ready lesson about provision, trust, and sharing what we have.",
    ageGroup: "Teens 13+",
    duration: 45
  }
] satisfies Array<Pick<Lesson, "id" | "title" | "summary" | "ageGroup" | "duration">>;

export default async function LessonsPage() {
  const lessons: Array<Pick<Lesson, "id" | "title" | "summary" | "ageGroup" | "duration">> = isDatabaseConfigured
    ? await db.lesson.findMany({
        where: { status: "published" },
        orderBy: { updatedAt: "desc" },
        take: 24
      })
    : fallbackLessons;

  return (
    <div className="bg-sky-50">
      <PageHero
        eyebrow="Bible Lessons"
        title="Discover engaging biblical lessons for every class."
        description="Search-friendly lesson discovery, age-group guidance, and room for multimedia resources carried over from the previous ministry platform."
        badges={[
          { icon: <PlayCircle size={16} />, label: `${lessons.length} lessons` },
          { icon: <Users size={16} />, label: "All age groups" },
          { icon: <Clock3 size={16} />, label: "Updated weekly" }
        ]}
      />

      <section className="page-shell py-10">
        <div className="rounded-[18px] border border-border bg-white p-4 legacy-shadow sm:p-6">
          <form action="/lessons" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center rounded-full border border-border bg-sky-50 px-4 py-3">
              <Search size={18} className="shrink-0 text-blue-700" />
              <input
                name="q"
                placeholder="Search lessons, scripture, or themes..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {["All Ages", "Videos", "Audio", "Documents"].map((filter) => (
                <span key={filter} className="rounded-full bg-sky-100 px-4 py-2 font-semibold text-blue-800">
                  {filter}
                </span>
              ))}
            </div>
          </form>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-[16px] border border-border bg-white p-5 legacy-shadow">
            <h2 className="text-xl font-semibold">Quick Filters</h2>
            <div className="mt-5 grid gap-2">
              {["Ages 3-6", "Ages 7-10", "Ages 11-14", "Teens 15+", "Videos", "Audio", "Documents"].map((item) => (
                <div key={item} className="rounded-xl bg-sky-50 px-4 py-3 text-sm font-semibold text-blue-900">
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <h2 className="text-2xl font-semibold">All Lessons</h2>
              <p className="text-sm text-muted-foreground">{lessons.length} lessons available</p>
            </div>
            <div className="grid gap-4">
              {lessons.map((lesson) => (
                <article
                  key={lesson.id}
                  className="grid overflow-hidden rounded-[18px] border border-border bg-white legacy-shadow md:grid-cols-[220px_1fr_140px]"
                >
                  <div className="flex min-h-[170px] items-center justify-center bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400 text-white">
                    <BookOpen size={44} />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      <span>{lesson.ageGroup}</span>
                      {"duration" in lesson && lesson.duration ? <span>{lesson.duration} min</span> : null}
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold">
                      <Link href={`/lessons/${lesson.id}` as Route}>{lesson.title}</Link>
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {lesson.summary || "A complete lesson outline will appear here once content is connected."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Memory verse", "Discussion prompts", "Class activity"].map((chip) => (
                        <span key={chip} className="rounded-full bg-sky-100 px-3 py-2 text-xs font-semibold text-blue-900">
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center border-t border-border bg-sky-50 p-4 md:border-l md:border-t-0">
                    <Link
                      href={`/lessons/${lesson.id}` as Route}
                      className="inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <PlayCircle size={16} />
                      Start
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-[18px] border border-border bg-white p-6 legacy-shadow">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Teacher note</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    Lessons should feel prepared, not merely posted.
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    To bring more human warmth into the experience, every lesson now presents itself more like a real teaching pack: not just title and summary, but clear signals about how it supports the person using it.
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <Sparkles size={24} />
                </div>
              </div>
              <Link
                href="/resources"
                className="mt-5 inline-flex items-center gap-2 rounded-md border border-blue-800 px-4 py-3 text-sm font-semibold text-blue-800"
              >
                Pair lessons with resources
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
