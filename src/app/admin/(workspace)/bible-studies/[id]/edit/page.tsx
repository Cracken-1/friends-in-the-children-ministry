import type { BibleStudy } from "@/generated/prisma/client";
import { notFound } from "next/navigation";

import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { CheckboxField, DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { deleteBibleStudyAction, updateBibleStudyAction } from "@/server/admin/content-actions";
import { db, isDatabaseConfigured } from "@/server/db/client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const fallbackStudies = {
  "study-1": {
    title: "Faith Under Pressure",
    summary: "A reflective study designed for older children and preteens learning how faith holds up under pressure.",
    content: "Guide learners through scripture, reflection questions, and simple take-home application.",
    featured: true,
    status: "published"
  },
  "study-2": {
    title: "Walking with Jesus",
    summary: "A teacher-guided Bible study with student prompts, personal reflection, and class conversation rhythm.",
    content: "Structure the study with a clear opening, scripture observation, and closing response.",
    featured: false,
    status: "draft"
  }
} as const;

export default async function EditBibleStudyPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const study: Pick<BibleStudy, "id" | "title" | "summary" | "content" | "featured" | "status"> | null =
    isDatabaseConfigured
      ? await db.bibleStudy.findUnique({
          where: { id },
          select: { id: true, title: true, summary: true, content: true, featured: true, status: true }
        })
      : (() => {
          const fallback = fallbackStudies[id as keyof typeof fallbackStudies];
          return fallback ? { id, ...fallback } : null;
        })();

  if (!study) notFound();

  return (
    <ContentEditorShell
      title={`Edit Bible Study: ${study.title}`}
      description="Refine study content, featured placement, and publication state."
      backHref="/admin/bible-studies"
      deleteAction={deleteBibleStudyAction.bind(null, id)}
      deleteLabel="Delete study"
    >
      <AdminEditorFeedback entityLabel="Bible study" success={query.success} error={query.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={updateBibleStudyAction.bind(null, id)} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required defaultValue={study.title} />
          <SelectField
            label="Status"
            name="status"
            defaultValue={study.status}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" }
            ]}
          />
          <div className="flex items-end">
            <CheckboxField label="Featured study" name="featured" defaultChecked={study.featured} />
          </div>
        </div>
        <TextareaField label="Summary" name="summary" rows={4} defaultValue={study.summary} />
        <TextareaField label="Study content" name="content" rows={14} required defaultValue={study.content} />
        <FormActions submitLabel="Save study" />
      </form>
    </ContentEditorShell>
  );
}
