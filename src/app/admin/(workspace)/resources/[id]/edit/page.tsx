import type { Resource } from "@/generated/prisma/client";
import { notFound } from "next/navigation";

import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { UploadField } from "@/components/admin/upload-field";
import { deleteResourceAction, updateResourceAction } from "@/server/admin/content-actions";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { getUploadStorageMode } from "@/server/services/uploads";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const fallbackResources = {
  "resource-1": {
    title: "David and Goliath Worksheet Pack",
    description: "Printable activities and memory verse sheets.",
    fileUrl: "/uploads/resources/david-and-goliath-pack.pdf",
    fileType: "PDF",
    status: "published"
  },
  "resource-2": {
    title: "Creation Coloring Pages",
    description: "Classroom printables for early learners.",
    fileUrl: "/uploads/resources/creation-coloring-pages.pdf",
    fileType: "PDF",
    status: "draft"
  }
} as const;

export default async function EditResourcePage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const storageMode = getUploadStorageMode();
  const resource: Pick<Resource, "id" | "title" | "description" | "fileUrl" | "fileType" | "status"> | null =
    isDatabaseConfigured
      ? await db.resource.findUnique({
          where: { id },
          select: { id: true, title: true, description: true, fileUrl: true, fileType: true, status: true }
        })
      : (() => {
          const fallback = fallbackResources[id as keyof typeof fallbackResources];
          return fallback ? { id, ...fallback } : null;
        })();

  if (!resource) notFound();

  return (
    <ContentEditorShell
      title={`Edit Resource: ${resource.title}`}
      description="Update the file reference, description, and publication status for this resource."
      backHref="/admin/resources"
      deleteAction={deleteResourceAction.bind(null, id)}
      deleteLabel="Delete resource"
    >
      <AdminEditorFeedback entityLabel="Resource" success={query.success} error={query.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={updateResourceAction.bind(null, id)} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required defaultValue={resource.title} />
          <UploadField
            label="File"
            name="fileUrl"
            folder="resources"
            required
            defaultValue={resource.fileUrl}
            storageMode={storageMode}
          />
          <Field label="File type" name="fileType" required defaultValue={resource.fileType} />
          <SelectField
            label="Status"
            name="status"
            defaultValue={resource.status}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" }
            ]}
          />
        </div>
        <TextareaField label="Description" name="description" rows={6} defaultValue={resource.description} />
        <FormActions submitLabel="Save resource" />
      </form>
    </ContentEditorShell>
  );
}
