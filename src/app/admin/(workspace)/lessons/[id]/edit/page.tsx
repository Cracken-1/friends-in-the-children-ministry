import type { Lesson, LessonAttachment } from "@/generated/prisma/client";
import { Download, FileAudio, FileImage, FileText, FileVideo, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

import { AdminPanel } from "@/components/admin/admin-ui";
import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { UploadField } from "@/components/admin/upload-field";
import {
  addLessonAttachmentAction,
  deleteLessonAction,
  deleteLessonAttachmentAction,
  updateLessonAction
} from "@/server/admin/content-actions";
import { adminFallbackLessons } from "@/server/admin/mock-data";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { getUploadStorageMode } from "@/server/services/uploads";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const fallbackDetails = {
  "lesson-1": {
    title: "David and Goliath",
    summary: "A courage-filled lesson plan with discussion prompts, memory verse, and activity ideas.",
    content: "Retell the story, draw out the tension, and help children see courage as trust in God rather than confidence in themselves.",
    ageGroup: "Ages 7-10",
    className: "Class B",
    duration: 35,
    difficulty: "Intermediate",
    status: "published"
  },
  "lesson-2": {
    title: "Creation and God's Good World",
    summary: "A creation lesson designed for younger learners with simple visual storytelling moments.",
    content: "Lead the class through the days of creation with repetition, wonder, and simple follow-up questions.",
    ageGroup: "Ages 3-6",
    className: "Class A",
    duration: 25,
    difficulty: "Beginner",
    status: "draft"
  }
} as const;

export default async function EditLessonPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const storageMode = getUploadStorageMode();
  const lesson:
    | (Pick<
        Lesson,
        "id" | "title" | "summary" | "content" | "ageGroup" | "className" | "duration" | "difficulty" | "status"
      > & {
        attachments?: Array<Pick<LessonAttachment, "id" | "filename" | "url" | "mimeType" | "size">>;
      })
    | null =
    isDatabaseConfigured
      ? await db.lesson.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            summary: true,
            content: true,
            ageGroup: true,
            className: true,
            duration: true,
            difficulty: true,
            status: true,
            attachments: {
              orderBy: { createdAt: "asc" },
              select: { id: true, filename: true, url: true, mimeType: true, size: true }
            }
          }
        })
      : (() => {
          const fallback = fallbackDetails[id as keyof typeof fallbackDetails];
          return fallback ? { id, ...fallback, attachments: [] } : null;
        })();

  if (!lesson) notFound();

  function inferAttachmentIcon(mimeType: string) {
    if (mimeType.startsWith("image/")) return <FileImage size={18} />;
    if (mimeType.startsWith("video/")) return <FileVideo size={18} />;
    if (mimeType.startsWith("audio/")) return <FileAudio size={18} />;
    return <FileText size={18} />;
  }

  function formatBytes(value: number) {
    if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    if (value >= 1024) return `${Math.round(value / 1024)} KB`;
    return `${value} B`;
  }

  return (
    <ContentEditorShell
      title={`Edit Lesson: ${lesson.title}`}
      description="Update lesson flow, age targeting, and publishing state from one place."
      backHref="/admin/lessons"
      deleteAction={deleteLessonAction.bind(null, id)}
      deleteLabel="Delete lesson"
    >
      <AdminEditorFeedback entityLabel="Lesson" success={query.success} error={query.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={updateLessonAction.bind(null, id)} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required defaultValue={lesson.title} />
          <Field label="Age group" name="ageGroup" required defaultValue={lesson.ageGroup} />
          <Field label="Class name" name="className" defaultValue={lesson.className} />
          <Field label="Duration (minutes)" name="duration" type="number" defaultValue={lesson.duration} />
          <Field label="Difficulty" name="difficulty" defaultValue={lesson.difficulty} />
          <SelectField
            label="Status"
            name="status"
            defaultValue={lesson.status}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" }
            ]}
          />
        </div>
        <TextareaField label="Summary" name="summary" rows={4} defaultValue={lesson.summary} />
        <TextareaField label="Lesson content" name="content" rows={12} required defaultValue={lesson.content} />
        <FormActions submitLabel="Save lesson" />
      </form>

      <AdminPanel
        title="Lesson attachments"
        description="Manage downloadable worksheets, PDFs, audio, video, and imported Telegram media for this lesson."
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            {lesson.attachments?.length ? (
              lesson.attachments.map((attachment) => (
                <article key={attachment.id} className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-white p-2 text-slate-700">
                        {inferAttachmentIcon(attachment.mimeType)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{attachment.filename}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {attachment.mimeType} · {formatBytes(attachment.size)}
                        </p>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-700"
                        >
                          <Download size={14} />
                          Open file
                        </a>
                      </div>
                    </div>
                    <form action={deleteLessonAttachmentAction.bind(null, id, attachment.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No attachments yet. Imported Telegram media and manual uploads will appear here.
              </div>
            )}
          </div>

          <form action={addLessonAttachmentAction.bind(null, id)} className="grid gap-5 rounded-[16px] border border-slate-200 bg-slate-50 p-4">
            <UploadField
              label="Attachment file"
              name="attachmentUrl"
              folder="attachments"
              storageMode={storageMode}
              metadataFields={{
                filenameName: "attachmentFilename",
                mimeTypeName: "attachmentMimeType",
                sizeName: "attachmentSize"
              }}
            />
            <FormActions submitLabel="Add attachment" />
          </form>
        </div>
      </AdminPanel>
    </ContentEditorShell>
  );
}
