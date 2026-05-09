import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { CheckboxField, DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { createBlogPostAction } from "@/server/admin/content-actions";
import { isDatabaseConfigured } from "@/server/db/client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewBlogPostPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <ContentEditorShell
      title="New Blog Post"
      description="Write a teacher-facing article, devotional reflection, or premium planning guide."
      backHref="/admin/blog"
    >
      <AdminEditorFeedback entityLabel="Blog post" success={params.success} error={params.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={createBlogPostAction} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required placeholder="Keeping Children Engaged During Bible Story Time" />
          <Field label="Premium price (KES cents)" name="priceCents" type="number" placeholder="15000" />
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
            <CheckboxField label="Premium article" name="premium" />
          </div>
        </div>
        <TextareaField label="Excerpt" name="excerpt" rows={4} placeholder="Short teaser for article cards and previews." />
        <TextareaField label="Article content" name="content" rows={14} required placeholder="Write the article body here." />
        <FormActions submitLabel="Create article" />
      </form>
    </ContentEditorShell>
  );
}
