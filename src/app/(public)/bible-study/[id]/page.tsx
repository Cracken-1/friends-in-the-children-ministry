import type { BibleStudy } from "@/generated/prisma/client";
import { BookMarked, Download, GraduationCap, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/public/page-hero";
import { db, isDatabaseConfigured } from "@/server/db/client";

type Props = { params: Promise<{ id: string }> };

const fallbackStudies = {
  "study-faith-pressure": {
    title: "Faith Under Pressure",
    summary: "A reflective study designed for older children and preteens learning how faith holds up under pressure.",
    content:
      "This study helps teachers guide learners through scripture, observation, personal reflection, and a simple take-home response.",
    featured: true
  },
  "study-walking-jesus": {
    title: "Walking with Jesus",
    summary: "A teacher-guided Bible study with student prompts, personal reflection, and class conversation rhythm.",
    content:
      "Use this study to create a slower, more thoughtful classroom rhythm that helps children notice what walking with Jesus looks like in practice.",
    featured: false
  }
} satisfies Record<string, Pick<BibleStudy, "title" | "summary" | "content" | "featured">>;

export default async function BibleStudyDetailPage({ params }: Props) {
  const { id } = await params;

  const study: Pick<BibleStudy, "title" | "summary" | "content" | "featured"> | null =
    isDatabaseConfigured
      ? await db.bibleStudy.findUnique({
          where: { id },
          select: { title: true, summary: true, content: true, featured: true }
        })
      : fallbackStudies[id as keyof typeof fallbackStudies] ?? null;

  if (!study) notFound();

  return (
    <div className="bg-sky-50">
      <PageHero
        eyebrow="Bible Study Detail"
        title={study.title}
        description={study.summary ?? "Study guide, reflection prompts, and teacher support."}
        badges={[
          { icon: <GraduationCap size={16} />, label: "Teacher guide ready" },
          { icon: <BookMarked size={16} />, label: "Student reflection friendly" },
          ...(study.featured ? [{ icon: <Star size={16} />, label: "Featured study" }] : [])
        ]}
      />

      <section className="page-shell py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <article className="rounded-[18px] bg-white p-8 legacy-shadow">
            <h2 className="text-3xl font-semibold text-blue-900">Study Overview</h2>
            <p className="mt-5 leading-8 text-muted-foreground">{study.content}</p>

            <div className="mt-8 rounded-[16px] bg-sky-50 p-6">
              <h3 className="text-2xl font-semibold text-slate-900">Suggested flow</h3>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-muted-foreground">
                <p>1. Read the focus scripture slowly and invite observation before explanation.</p>
                <p>2. Use guided questions that help learners speak instead of simply repeat.</p>
                <p>3. Close with one practical response children can carry home.</p>
              </div>
            </div>
          </article>

          <aside className="rounded-[18px] bg-white p-6 legacy-shadow">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Download size={24} />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-slate-900">Study materials</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Teacher guides, printable worksheets, and PDF exports will connect here as the backend layer comes online.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-3 text-sm font-semibold text-white">
              <Download size={16} />
              Download guide
            </button>
          </aside>
        </div>
      </section>
    </div>
  );
}
