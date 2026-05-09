import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { createLessonAction } from "@/server/admin/content-actions";
import { isDatabaseConfigured } from "@/server/db/client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewLessonPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <ContentEditorShell
      title="New Lesson"
      description="Create a lesson with the structure, tone, and teaching cues needed for real classroom use."
      backHref="/admin/lessons"
    >
      <AdminEditorFeedback entityLabel="Lesson" success={params.success} error={params.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={createLessonAction} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required placeholder="David and Goliath" />
          <Field label="Age group" name="ageGroup" required placeholder="Ages 7-10" />
          <Field label="Class name" name="className" placeholder="Class B" />
          <Field label="Duration (minutes)" name="duration" type="number" placeholder="35" />
          <Field label="Difficulty" name="difficulty" placeholder="Beginner" />
          <SelectField
            label="Status"
            name="status"
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" }
            ]}
          />
        </div>
        <TextareaField label="Summary" name="summary" rows={4} placeholder="Short lesson overview for teachers." />
        <TextareaField label="Lesson content" name="content" rows={12} required placeholder="Full lesson content, teaching flow, discussion prompts, and activity ideas." />
        <FormActions submitLabel="Create lesson" />
      </form>
    </ContentEditorShell>
  );
}
