import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FieldHint, FormActions, SelectField } from "@/components/admin/content-form";
import { requireSystemAdminSession } from "@/server/auth/session";
import { createUserAction } from "@/server/admin/content-actions";
import { isDatabaseConfigured } from "@/server/db/client";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewUserPage({ searchParams }: PageProps) {
  await requireSystemAdminSession();
  const params = await searchParams;
  return (
    <ContentEditorShell
      title="New Admin User"
      description="Create a system administrator or editor account for the workspace."
      backHref="/admin/users"
    >
      <AdminEditorFeedback entityLabel="User" success={params.success} error={params.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={createUserAction} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Display name" name="displayName" placeholder="Lead Administrator" />
          <Field label="Email" name="email" required placeholder="admin@example.com" />
          <Field label="Password" name="password" type="password" required placeholder="Create a strong password">
            <FieldHint>Minimum 8 characters. This will be hashed before storage.</FieldHint>
          </Field>
          <SelectField
            label="Role"
            name="role"
            options={[
              { label: "Editor", value: "admin" },
              { label: "System Admin", value: "super_admin" }
            ]}
          />
        </div>
        <FormActions submitLabel="Create user" />
      </form>
    </ContentEditorShell>
  );
}
