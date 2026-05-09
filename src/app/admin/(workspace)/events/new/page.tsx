import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { createEventAction } from "@/server/admin/content-actions";
import { isDatabaseConfigured } from "@/server/db/client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewEventPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <ContentEditorShell
      title="New Event"
      description="Add a ministry gathering, training session, or calendar moment for teachers and families."
      backHref="/admin/events"
    >
      <AdminEditorFeedback entityLabel="Event" success={params.success} error={params.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={createEventAction} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required placeholder="Teachers Prayer and Planning Morning" />
          <Field label="Location" name="location" placeholder="Nairobi Central Fellowship" />
          <Field label="Starts at" name="startsAt" type="datetime-local" required />
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
        <TextareaField label="Description" name="description" rows={8} required placeholder="Describe the event, audience, and key agenda." />
        <FormActions submitLabel="Create event" />
      </form>
    </ContentEditorShell>
  );
}
