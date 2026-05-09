import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { createTeachingTipAction } from "@/server/admin/content-actions";
import { isDatabaseConfigured } from "@/server/db/client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewTeachingTipPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <ContentEditorShell
      title="New Teaching Tip"
      description="Add practical coaching content that keeps the ministry voice warm, useful, and grounded."
      backHref="/admin/teaching-tips"
    >
      <AdminEditorFeedback entityLabel="Teaching tip" success={params.success} error={params.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={createTeachingTipAction} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required placeholder="Keep activities shorter than you think" />
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
        <TextareaField label="Teaching tip content" name="content" rows={12} required placeholder="Write the practical teaching guidance here." />
        <FormActions submitLabel="Create teaching tip" />
      </form>
    </ContentEditorShell>
  );
}
