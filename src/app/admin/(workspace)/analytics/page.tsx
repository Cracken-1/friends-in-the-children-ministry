import { BarChart3, BookOpen, Download, Users } from "lucide-react";

import { AdminKpiCard, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { formatCompactNumber } from "@/lib/utils";
import { adminOverviewFallback } from "@/server/admin/mock-data";

export default function AdminAnalyticsPage() {
  const totalViews = 12847;
  const downloads = adminOverviewFallback.stats.totalResources * 42;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Reporting"
        title="Analytics"
        description="A deliberately clearer reporting layer for the rebuild. Right now it provides a professional shell for the metrics the old site exposed in a rougher way."
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard label="Content views" value={formatCompactNumber(totalViews)} icon={<BarChart3 size={24} />} tone="dark" />
        <AdminKpiCard label="Lesson engagement" value={adminOverviewFallback.stats.totalLessons} icon={<BookOpen size={24} />} tone="blue" />
        <AdminKpiCard label="Downloads" value={formatCompactNumber(downloads)} icon={<Download size={24} />} tone="green" />
        <AdminKpiCard label="Audience" value={adminOverviewFallback.stats.totalSubscribers} icon={<Users size={24} />} tone="amber" />
      </div>

      <AdminPanel title="Reporting roadmap" description="This tracks the master prompt: basic dashboard first, deeper analytics after content, uploads, and Telegram ingestion are stable.">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            "Top lessons by views and downloads",
            "Blog readership with premium conversion tracking",
            "Telegram import throughput and failure reasons"
          ].map((item) => (
            <div key={item} className="rounded-[16px] border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}
