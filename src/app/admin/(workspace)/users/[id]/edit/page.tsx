import type { User } from "@/generated/prisma/client";
import { notFound } from "next/navigation";

import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { DatabaseNotice, Field, FieldHint, FormActions, SelectField } from "@/components/admin/content-form";
import { requireSystemAdminSession } from "@/server/auth/session";
import { deleteUserAction, updateUserAction } from "@/server/admin/content-actions";
import { adminFallbackUsers } from "@/server/admin/mock-data";
import { db, isDatabaseConfigured } from "@/server/db/client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditUserPage({ params, searchParams }: Props) {
  await requireSystemAdminSession();
  const { id } = await params;
  const query = await searchParams;

  const user: Pick<User, "id" | "email" | "displayName" | "role"> | null =
    isDatabaseConfigured
      ? await db.user.findUnique({
          where: { id },
          select: { id: true, email: true, displayName: true, role: true }
        })
      : adminFallbackUsers.find((entry) => entry.id === id) ?? null;

  if (!user) notFound();

  return (
    <ContentEditorShell
      title={`Edit User: ${user.displayName ?? user.email}`}
      description="Update account details, access level, or password for this workspace user."
      backHref="/admin/users"
      deleteAction={deleteUserAction.bind(null, id)}
      deleteLabel="Delete user"
    >
      <AdminEditorFeedback entityLabel="User" success={query.success} error={query.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={updateUserAction.bind(null, id)} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Display name" name="displayName" defaultValue={user.displayName} />
          <Field label="Email" name="email" required defaultValue={user.email} />
          <Field label="New password" name="password" type="password" placeholder="Leave blank to keep the current password">
            <FieldHint>Only fill this in when rotating or resetting the user password.</FieldHint>
          </Field>
          <SelectField
            label="Role"
            name="role"
            defaultValue={user.role}
            options={[
              { label: "Editor", value: "admin" },
              { label: "System Admin", value: "super_admin" }
            ]}
          />
        </div>
        <FormActions submitLabel="Save user" />
      </form>
    </ContentEditorShell>
  );
}
