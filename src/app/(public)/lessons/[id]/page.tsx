import type { Lesson, LessonAttachment } from "@/generated/prisma/client";
import { BookOpen, CheckCircle2, Clock3, Download, FileAudio, FileImage, FileText, FileVideo, Users } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { db, isDatabaseConfigured } from "@/server/db/client";

type LessonPageProps = {
  params: Promise<{ id: string }>;
};

const fallbackLessons = {
  "fallback-david-goliath": {
    title: "David and Goliath",
    ageGroup: "Ages 7-10",
    duration: 35,
    content:
      "God used David's faith and courage to defeat a giant enemy. This lesson helps children see that strength comes from trusting God, not from size or status.",
    summary: "A courage-filled lesson plan with discussion prompts, memory verse, and activity ideas.",
    attachments: []
  },
  "fallback-creation": {
    title: "Creation and God's Good World",
    ageGroup: "Ages 3-6",
    duration: 25,
    content:
      "This lesson introduces young learners to God's creation through simple storytelling, repetition, and wonder.",
    summary: "A creation lesson designed for younger learners with simple visual storytelling moments.",
    attachments: []
  }
} satisfies Record<string, Pick<Lesson, "title" | "ageGroup" | "duration" | "content" | "summary"> & { attachments: Array<Pick<LessonAttachment, "id" | "filename" | "url" | "mimeType" | "size">> }>;

export default async function LessonDetailPage({ params }: LessonPageProps) {
  const { id } = await params;

  const lesson =
    isDatabaseConfigured
      ? await db.lesson.findUnique({
          where: { id },
          include: {
            attachments: {
              orderBy: { createdAt: "asc" }
            }
          }
        })
      : fallbackLessons[id as keyof typeof fallbackLessons] ?? fallbackLessons["fallback-david-goliath"];

  function inferAttachmentIcon(mimeType: string) {
    if (mimeType.startsWith("image/")) return <FileImage size={16} />;
    if (mimeType.startsWith("video/")) return <FileVideo size={16} />;
    if (mimeType.startsWith("audio/")) return <FileAudio size={16} />;
    return <FileText size={16} />;
  }

  function formatBytes(value: number) {
    if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    if (value >= 1024) return `${Math.round(value / 1024)} KB`;
    return `${value} B`;
  }

  return (
    <div className="bg-sky-50">
      <PageHero
        eyebrow="Lesson Detail"
        title={lesson?.title ?? "Lesson"}
        description={lesson?.summary ?? "Lesson details and downloadable teaching support."}
        badges={[
          { icon: <Users size={16} />, label: lesson?.ageGroup ?? "All ages" },
          { icon: <Clock3 size={16} />, label: lesson?.duration ? `${lesson.duration} min` : "Flexible duration" }
        ]}
      />

      <section className="page-shell py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <article className="rounded-[18px] bg-white p-8 legacy-shadow">
            <h2 className="text-3xl font-semibold text-blue-900">Lesson Overview</h2>
            <p className="mt-5 leading-8 text-muted-foreground">
              {lesson?.content ?? "Full lesson content will appear here once the live records are connected."}
            </p>

            <div className="mt-8 rounded-[16px] bg-sky-50 p-6">
              <h3 className="text-2xl font-semibold">Teaching Flow</h3>
              <div className="mt-4 grid gap-4 text-sm leading-7 text-muted-foreground">
                <p>1. Welcome and opening prayer.</p>
                <p>2. Bible story retelling with visual support.</p>
                <p>3. Discussion questions and memory verse.</p>
                <p>4. Activity or worksheet follow-up.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {["Clear memory verse moment", "Simple discussion rhythm", "Easy classroom follow-up"].map((item) => (
                <div key={item} className="rounded-[16px] border border-border bg-white p-4">
                  <CheckCircle2 className="text-blue-700" size={18} />
                  <p className="mt-3 text-sm font-semibold text-slate-900">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-[18px] bg-white p-6 legacy-shadow">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white">
              <BookOpen size={28} />
            </div>
            <h3 className="mt-5 text-2xl font-semibold">Resources</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Downloadable worksheets, PDFs, audio, video, and supporting lesson files live here as part of the same teaching pack.
            </p>
            <div className="mt-6 grid gap-3">
              {lesson?.attachments?.length ? (
                lesson.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[14px] border border-border bg-sky-50 px-4 py-3 transition hover:border-blue-300 hover:bg-sky-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-white p-2 text-blue-700">
                        {inferAttachmentIcon(attachment.mimeType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{attachment.filename}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {attachment.mimeType} · {formatBytes(attachment.size)}
                        </p>
                      </div>
                      <Download size={16} className="shrink-0 text-blue-700" />
                    </div>
                  </a>
                ))
              ) : (
                <div className="rounded-[14px] border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
                  No attachments have been added to this lesson yet.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
