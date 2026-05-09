import { Download, Mail, UserRoundPlus } from "lucide-react";

import { AdminKpiCard, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { adminOverviewFallback } from "@/server/admin/mock-data";

export default function AdminNewsletterPage() {
  const subscriberCount = adminOverviewFallback.stats.totalSubscribers;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Audience"
        title="Newsletter Subscribers"
        description="The newsletter area needs to feel administrative without becoming cold. This gives the team a more intentional place to manage follow-up and export work."
      />

      <div className="grid gap-5 md:grid-cols-3">
        <AdminKpiCard label="Total subscribers" value={subscriberCount} icon={<Mail size={24} />} tone="blue" />
        <AdminKpiCard label="New this week" value={18} icon={<UserRoundPlus size={24} />} tone="green" />
        <AdminKpiCard label="Export readiness" value="CSV ready" icon={<Download size={24} />} tone="dark" />
      </div>

      <AdminPanel title="Subscriber management" description="Double opt-in, export, and unsubscribe controls will live here as the email layer is wired in.">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">Current direction</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              The public subscribe endpoint is in place. The next step is to connect confirmation email delivery, unsubscribe tokens, and export actions from the same surface.
            </p>
          </article>
          <article className="rounded-[16px] border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">Immediate win</h3>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Once Resend and Supabase auth are configured, this page can graduate from a planning console into the actual subscriber operations dashboard described in the master brief.
            </p>
          </article>
        </div>
      </AdminPanel>
    </div>
  );
}
