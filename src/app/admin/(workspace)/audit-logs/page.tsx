import type { AdminAuditLog } from "@/generated/prisma/client";
import { Activity, FileClock, ShieldCheck } from "lucide-react";

import { AdminEmptyState, AdminKpiCard, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { formatDateTime } from "@/lib/utils";
import { adminFallbackAuditLogs } from "@/server/admin/mock-data";
import { requireSystemAdminSession } from "@/server/auth/session";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const dynamic = "force-dynamic";

type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actorName: string;
  actorEmail: string;
};

function humanizeEntity(entityType: string) {
  return entityType
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export default async function AdminAuditLogsPage() {
  await requireSystemAdminSession();
  const logs: AuditRow[] = isDatabaseConfigured
    ? await db.adminAuditLog
        .findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            actor: {
              select: {
                displayName: true,
                email: true
              }
            }
          }
        })
        .then(
          (
            entries: Array<
              Pick<AdminAuditLog, "id" | "action" | "entityType" | "entityId" | "createdAt"> & {
                actor: { displayName: string | null; email: string } | null;
              }
            >
          ) =>
            entries.map((entry) => ({
              id: entry.id,
              action: entry.action,
              entityType: entry.entityType,
              entityId: entry.entityId,
              createdAt: formatDateTime(entry.createdAt),
              actorName: entry.actor?.displayName ?? "System or local session",
              actorEmail: entry.actor?.email ?? "local-session"
            }))
        )
    : [...adminFallbackAuditLogs];

  const createCount = logs.filter((log) => log.action === "create").length;
  const updateCount = logs.filter((log) => log.action === "update").length;
  const authCount = logs.filter((log) => log.entityType === "auth_session").length;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Operations"
        title="Audit Logs"
        description="This is the activity trail for sensitive admin actions: logins, logouts, and content changes. It gives the workspace a much more accountable backend footing."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <AdminKpiCard label="Recent activity" value={logs.length} icon={<Activity size={24} />} tone="dark" />
        <AdminKpiCard label="Content updates" value={createCount + updateCount} icon={<FileClock size={24} />} tone="blue" />
        <AdminKpiCard label="Auth events" value={authCount} icon={<ShieldCheck size={24} />} tone="green" />
      </div>

      <AdminPanel title="Activity Trail" description="Newest events first, with actor, action, target type, and timestamp.">
        {logs.length ? (
          <div className="grid gap-4">
            {logs.map((log) => (
              <article key={log.id} className="rounded-[16px] border border-slate-200 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      <span>{log.action}</span>
                      <span>{humanizeEntity(log.entityType)}</span>
                      {log.entityId ? <span>ID: {log.entityId.slice(0, 8)}</span> : null}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{log.actorName}</h3>
                    <p className="mt-1 text-sm text-slate-500">{log.actorEmail}</p>
                  </div>
                  <div className="text-sm font-medium text-slate-500">{log.createdAt}</div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No audit events yet"
            body="As the team signs in and starts working with content, those actions will appear here."
          />
        )}
      </AdminPanel>
    </div>
  );
}
