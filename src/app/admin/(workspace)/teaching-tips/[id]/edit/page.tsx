import type { TeachingTip } from "@/generated/prisma/client";
import { notFound } from "next/navigation";

import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { deleteTeachingTipAction, updateTeachingTipAction } from "@/server/admin/content-actions";
import { db, isDatabaseConfigured } from "@/server/db/client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const fallbackTips = {
  "tip-1": {
    title: "Keep activities shorter than you think",
    content: "Young learners often respond better when we end a touch earlier than the perfect adult timetable suggests.",
    status: "published"
  },
  "tip-2": {
    title: "Give parents one follow-up question",
    content: "One simple take-home prompt can make the lesson feel alive after Sunday is over.",
    status: "draft"
  }
} as const;

export default async function EditTeachingTipPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const tip: Pick<TeachingTip, "id" | "title" | "content" | "status"> | null =
    isDatabaseConfigured
      ? await db.teachingTip.findUnique({
          where: { id },
          select: { id: true, title: true, content: true, status: true }
        })
      : (() => {
          const fallback = fallbackTips[id as keyof typeof fallbackTips];
          return fallback ? { id, ...fallback } : null;
        })();

  if (!tip) notFound();

  return (
    <ContentEditorShell
      title={`Edit Teaching Tip: ${tip.title}`}
      description="Refine the practical guidance teachers will actually use in preparation and follow-up."
      backHref="/admin/teaching-tips"
      deleteAction={deleteTeachingTipAction.bind(null, id)}
      deleteLabel="Delete tip"
    >
      <AdminEditorFeedback entityLabel="Teaching tip" success={query.success} error={query.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={updateTeachingTipAction.bind(null, id)} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required defaultValue={tip.title} />
          <SelectField
            label="Status"
            name="status"
            defaultValue={tip.status}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" }
            ]}
          />
        </div>
        <TextareaField label="Teaching tip content" name="content" rows={12} required defaultValue={tip.content} />
        <FormActions submitLabel="Save teaching tip" />
      </form>
    </ContentEditorShell>
  );
}
