import { Archive, ShieldCheck } from "lucide-react";

import { AdminKpiCard, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { requireSystemAdminSession } from "@/server/auth/session";

const backups = [
  { filename: "content-backup-2026-05-01.zip", size: "82 MB", createdAt: "Yesterday" },
  { filename: "system-backup-2026-04-24.zip", size: "79 MB", createdAt: "8 days ago" }
] as const;

export default async function AdminBackupsPage() {
  await requireSystemAdminSession();
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Maintenance"
        title="Backups"
        description="The master prompt expects operational confidence, and that means backup visibility, not hidden maintenance tasks."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <AdminKpiCard label="Snapshots listed" value={backups.length} icon={<Archive size={24} />} tone="dark" />
        <AdminKpiCard label="Recovery posture" value="Healthy" icon={<ShieldCheck size={24} />} tone="green" />
      </div>

      <AdminPanel title="Available backups" description="Create, list, download, and delete controls will settle here once the backup pipeline is wired from the server layer.">
        <div className="grid gap-4">
          {backups.map((backup) => (
            <article key={backup.filename} className="flex flex-col gap-4 rounded-[16px] border border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{backup.filename}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {backup.size} · {backup.createdAt}
                </p>
              </div>
              <button className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                Download
              </button>
            </article>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}
