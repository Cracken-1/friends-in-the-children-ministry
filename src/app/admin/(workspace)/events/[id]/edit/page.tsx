import type { Event } from "@/generated/prisma/client";
import { notFound } from "next/navigation";

import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { deleteEventAction, updateEventAction } from "@/server/admin/content-actions";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { toDateTimeLocalValue } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const fallbackEvents = {
  "event-1": {
    title: "Teachers Prayer and Planning Morning",
    description: "A shared planning and prayer session for the upcoming month of children's ministry teaching.",
    startsAt: new Date("2026-06-14T09:00:00"),
    location: "Nairobi Central Fellowship",
    status: "published"
  },
  "event-2": {
    title: "Holiday Bible Club Orientation",
    description: "A practical orientation for volunteers preparing to lead holiday Bible club sessions.",
    startsAt: new Date("2026-07-02T10:00:00"),
    location: "Community Hall",
    status: "draft"
  }
} as const;

export default async function EditEventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const event: Pick<Event, "id" | "title" | "description" | "startsAt" | "location" | "status"> | null =
    isDatabaseConfigured
      ? await db.event.findUnique({
          where: { id },
          select: { id: true, title: true, description: true, startsAt: true, location: true, status: true }
        })
      : (() => {
          const fallback = fallbackEvents[id as keyof typeof fallbackEvents];
          return fallback ? { id, ...fallback } : null;
        })();

  if (!event) notFound();

  return (
    <ContentEditorShell
      title={`Edit Event: ${event.title}`}
      description="Update timing, location, and publication state for this event."
      backHref="/admin/events"
      deleteAction={deleteEventAction.bind(null, id)}
      deleteLabel="Delete event"
    >
      <AdminEditorFeedback entityLabel="Event" success={query.success} error={query.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={updateEventAction.bind(null, id)} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required defaultValue={event.title} />
          <Field label="Location" name="location" defaultValue={event.location} />
          <Field label="Starts at" name="startsAt" type="datetime-local" required defaultValue={toDateTimeLocalValue(event.startsAt)} />
          <SelectField
            label="Status"
            name="status"
            defaultValue={event.status}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" }
            ]}
          />
        </div>
        <TextareaField label="Description" name="description" rows={8} required defaultValue={event.description} />
        <FormActions submitLabel="Save event" />
      </form>
    </ContentEditorShell>
  );
}
