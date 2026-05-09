import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { UploadField } from "@/components/admin/upload-field";
import { createResourceAction } from "@/server/admin/content-actions";
import { isDatabaseConfigured } from "@/server/db/client";
import { getUploadStorageMode } from "@/server/services/uploads";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewResourcePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const storageMode = getUploadStorageMode();

  return (
    <ContentEditorShell
      title="New Resource"
      description="Add a printable, worksheet, or downloadable support file to the ministry library."
      backHref="/admin/resources"
    >
      <AdminEditorFeedback entityLabel="Resource" success={params.success} error={params.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={createResourceAction} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required placeholder="David and Goliath Worksheet Pack" />
          <UploadField
            label="File"
            name="fileUrl"
            folder="resources"
            required
            storageMode={storageMode}
          />
          <Field label="File type" name="fileType" required placeholder="PDF" />
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
        <TextareaField label="Description" name="description" rows={6} placeholder="Explain what the resource helps teachers or learners do." />
        <FormActions submitLabel="Create resource" />
      </form>
    </ContentEditorShell>
  );
}
