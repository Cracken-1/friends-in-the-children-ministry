import { AlertTriangle, HardDriveUpload, MessageCircleMore, Shield } from "lucide-react";

import { AdminActionCard, AdminChecklist, AdminNotice, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { adminConfigReadiness, adminReadinessSummary } from "@/server/admin/config-readiness";
import { requireSystemAdminSession } from "@/server/auth/session";

const uploadChecks = [
  "Server-side MIME detection is enabled.",
  "Folder names and storage paths are generated server-side, not user-controlled.",
  "Executable file types remain blocked.",
  "Supabase mode now supports direct browser-to-storage uploads to avoid route timeouts."
] as const;

const telegramChecks = [
  "Webhook route should validate the Telegram secret token.",
  "Historical channel exports can now be staged into the import queue before the bot goes live.",
  "Manual mode and webhook mode should remain clearly separated.",
  "Import errors should surface in admin instead of disappearing into logs."
] as const;

export default async function AdminSettingsPage() {
  await requireSystemAdminSession();
  const outstandingReadinessItems = adminReadinessSummary.filter((item) => item.status !== "ready");
  const environmentCards = [
    {
      title: "Database and Prisma",
      body: "PostgreSQL still needs to be connected before content editors become fully persistent.",
      status: "Pending"
    },
    {
      title: "Supabase and storage",
      body: "Auth is live on Supabase, and direct uploads are ready once Storage is configured.",
      status: "Fallback active"
    },
    {
      title: "Telegram and notifications",
      body: "The UI is ready, but the production-grade worker and webhook setup still need real credentials.",
      status: "Pending"
    }
  ] as const;
  const outstandingItems = environmentCards.filter((item) => {
    if (item.title === "Database and Prisma") return !adminConfigReadiness.database;
    if (item.title === "Supabase and storage") return !adminConfigReadiness.supabase;
    if (item.title === "Telegram and notifications") return !adminConfigReadiness.telegram;
    return true;
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="System Settings"
        title="Settings and Safeguards"
        description="Outstanding setup items for storage, authentication, messaging, and production hardening."
      />

      {!adminConfigReadiness.database || !adminConfigReadiness.supabase || !adminConfigReadiness.telegram ? (
        <AdminNotice
          tone="warning"
          title="Setup still required"
          body="Complete the remaining services below before switching the platform fully into production mode."
        />
      ) : null}

      <AdminPanel title="Environment Readiness" description="Remaining service setup and current fallback states.">
        <AdminChecklist items={outstandingReadinessItems} />
      </AdminPanel>

      <div className="grid gap-5 lg:grid-cols-3">
        {outstandingItems.map((item) => (
          <AdminActionCard
            key={item.title}
            title={item.title}
            body={item.body}
            icon={<Shield size={20} />}
            action={
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                {item.status}
              </span>
            }
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Upload health" description="Current upload handling rules and remaining storage work.">
          <div className="mb-5 flex items-start gap-3 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4">
            <HardDriveUpload className="mt-0.5 text-emerald-700" size={20} />
            <p className="text-sm leading-7 text-emerald-900">
              Local fallback remains available, but Supabase mode now avoids large server upload bottlenecks by sending files straight to storage.
            </p>
          </div>
          <div className="grid gap-3">
            {uploadChecks.map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Telegram integration health" description="Remaining operational work for production webhook processing.">
          <div className="mb-5 flex items-start gap-3 rounded-[16px] border border-amber-200 bg-amber-50 p-4">
            <MessageCircleMore className="mt-0.5 text-amber-700" size={20} />
            <p className="text-sm leading-7 text-amber-900">
              Production webhook handling still depends on queue workers and monitoring, but historical import staging is now available from Telegram Desktop exports.
            </p>
          </div>
          <div className="grid gap-3">
            {telegramChecks.map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel title="Security posture" description="Remaining steps required for full production hardening.">
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
            <AlertTriangle size={20} className="text-amber-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Pending</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Worker-backed Telegram processing, finer role restrictions, and signed private asset delivery still need to be wired for production.
            </p>
          </article>
          <article className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
            <HardDriveUpload size={20} className="text-emerald-700" />
            <h3 className="mt-3 font-semibold text-slate-900">Fallback in use</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Local fallback is still available, but Supabase direct upload should be the default for large lesson media.
            </p>
          </article>
        </div>
      </AdminPanel>
    </div>
  );
}
