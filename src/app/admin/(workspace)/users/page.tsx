import type { User } from "@/generated/prisma/client";
import { Plus, Shield, UserRound } from "lucide-react";
import Link from "next/link";

import { AdminListFeedback } from "@/components/admin/admin-action-feedback";
import { AdminEmptyState, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { describeAdminRole, formatAdminRole } from "@/lib/roles";
import { adminFallbackUsers } from "@/server/admin/mock-data";
import { requireSystemAdminSession } from "@/server/auth/session";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  await requireSystemAdminSession();
  const params = await searchParams;
  const users: Array<Pick<User, "id" | "email" | "displayName" | "role">> | typeof adminFallbackUsers =
    isDatabaseConfigured
      ? await db.user.findMany({
          orderBy: [{ role: "desc" }, { createdAt: "asc" }],
          select: { id: true, email: true, displayName: true, role: true }
        })
      : adminFallbackUsers;

  return (
    <div className="space-y-8">
      <AdminListFeedback entityLabel="User" success={params.success} error={params.error} />
      <AdminPageHeader
        eyebrow="User Management"
        title="Admin Users"
        description="Manage access for system administrators and editors."
        actions={
          <Link href={"/admin/users/new" as any} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            <Plus size={16} />
            New user
          </Link>
        }
      />

      <AdminPanel title="Workspace access" description="System Admins can manage the platform and the CMS. Editors focus on website content management.">
        {users.length ? (
          <div className="grid gap-4">
            {users.map((user) => (
              <article key={user.id} className="rounded-[16px] border border-slate-200 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      <UserRound size={14} />
                      Workspace user
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{user.displayName ?? "Unnamed administrator"}</h3>
                    <p className="mt-2 text-sm text-slate-500">{user.email}</p>
                    <p className="mt-2 text-sm text-slate-500">{describeAdminRole(user.role)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${user.role === "super_admin" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                      <Shield size={14} />
                      {formatAdminRole(user.role)}
                    </span>
                    <Link href={`/admin/users/${user.id}/edit` as any} className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                      Edit
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No admin users yet"
            body="Create the first admin account and this section will become the access management area for the workspace."
          />
        )}
      </AdminPanel>
    </div>
  );
}
