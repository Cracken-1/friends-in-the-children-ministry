import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { CheckboxField, DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { createBibleStudyAction } from "@/server/admin/content-actions";
import { isDatabaseConfigured } from "@/server/db/client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewBibleStudyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <ContentEditorShell
      title="New Bible Study"
      description="Create a study guide that can later power teacher guides, worksheets, and printable exports."
      backHref="/admin/bible-studies"
    >
      <AdminEditorFeedback entityLabel="Bible study" success={params.success} error={params.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={createBibleStudyAction} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required placeholder="Faith Under Pressure" />
          <SelectField
            label="Status"
            name="status"
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" }
            ]}
          />
          <div className="flex items-end">
            <CheckboxField label="Featured study" name="featured" />
          </div>
        </div>
        <TextareaField label="Summary" name="summary" rows={4} placeholder="Short study overview for teachers and learners." />
        <TextareaField label="Study content" name="content" rows={14} required placeholder="Write the study content, flow, and reflection prompts here." />
        <FormActions submitLabel="Create study" />
      </form>
    </ContentEditorShell>
  );
}
