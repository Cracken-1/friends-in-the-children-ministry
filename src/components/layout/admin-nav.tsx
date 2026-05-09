"use client";

import type { UserRole } from "@/generated/prisma/client";
import type { Route } from "next";
import { BookOpen, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { isSystemAdminRole } from "@/lib/roles";
import { adminSections } from "@/components/layout/admin-nav-data";

type AdminNavProps = {
  displayName?: string | null;
  email?: string;
  sessionMode?: "supabase";
  role: UserRole;
};

export function AdminNav({ displayName, email, sessionMode = "supabase", role }: AdminNavProps) {
  const pathname = usePathname();
  const visibleSections = adminSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(role))
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="hidden xl:fixed xl:left-0 xl:top-0 xl:block xl:h-screen xl:w-[290px] xl:border-r xl:border-border xl:bg-white">
      <div className="flex h-screen w-[290px] flex-col bg-white">
        <div className="border-b border-border px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
              <BookOpen size={18} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Friends in the Children Ministries</p>
              <p className="mt-1 text-xs text-slate-500">Publishing, care, and ministry operations</p>
              <span className="mt-2 inline-flex rounded-full bg-slate-950 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                Admin
              </span>
            </div>
          </div>
        </div>

        <details className="mx-4 mt-4 rounded-[18px] border border-slate-200 bg-slate-50 open:bg-blue-50">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-900 marker:hidden">
            Workspace
          </summary>
          <div className="border-t border-slate-200 px-4 py-4 text-sm leading-6 text-slate-600">
            Manage lessons, studies, blog posts, resources, events, users, and integration workflows from one place.
          </div>
        </details>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-7">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {section.title}
              </p>
              <div className="mt-2 grid gap-1">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href as Route}
                      className={cn(
                        "inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-50 hover:text-black"
                      )}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{displayName || "Authenticated administrator"}</p>
              <p className="truncate text-xs text-slate-500">{email || "Session active"}</p>
              <p className="mt-1 text-[11px] font-medium text-emerald-600">
                {sessionMode === "supabase" ? "Supabase session active" : "Authenticated access"}
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                {isSystemAdminRole(role) ? "System Admin" : "Editor"}
              </p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post" className="mt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
