import Link from "next/link";

import { AdminClock } from "@/components/admin/admin-clock";
import { adminSections } from "@/components/layout/admin-nav-data";
import { AdminNav } from "@/components/layout/admin-nav";
import { requireAdminSession } from "@/server/auth/session";
import { adminConfigReadiness } from "@/server/admin/config-readiness";

export default async function AdminWorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();
  const readinessItems = [
    adminConfigReadiness.database ? "Database connected" : "Database pending",
    adminConfigReadiness.supabase ? "Supabase keys ready" : "Supabase pending",
    adminConfigReadiness.telegram ? "Telegram configured" : "Telegram pending"
  ];
  const mobileNavItems = adminSections.reduce<Array<{ href: string; label: string }>>((items, section) => {
    section.items.forEach((item) => {
      if (!item.roles || item.roles.includes(session.role)) {
        items.push({ href: item.href, label: item.label });
      }
    });
    return items;
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f3f6fb_100%)]">
      <AdminNav displayName={session.displayName} email={session.email} sessionMode={session.mode} role={session.role} />
      <main className="min-h-screen min-w-0 xl:pl-[290px]">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-[rgba(248,251,255,0.96)] px-6 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Ministry administration workspace</p>
              <p className="text-xs text-slate-500">{session.displayName || session.email} is signed in.</p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <AdminClock />
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                {readinessItems.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:hidden">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as any}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
