import Link from "next/link";
import {
  Archive,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  BookOpen,
  BookText,
  CalendarDays,
  FileCog,
  Download,
  Lightbulb,
  MessageCircleMore,
  Settings,
  Users
} from "lucide-react";

import {
  AdminActionCard,
  AdminChecklist,
  AdminKpiCard,
  AdminNotice,
  AdminPageHeader,
  AdminPanel
} from "@/components/admin/admin-ui";
import { getGreeting } from "@/lib/utils";
import { adminConfigReadiness, adminReadinessSummary } from "@/server/admin/config-readiness";
import { adminOverviewFallback } from "@/server/admin/mock-data";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const greeting = getGreeting();
  const stats = isDatabaseConfigured
    ? {
        totalLessons: await db.lesson.count(),
        publishedLessons: await db.lesson.count({ where: { status: "published" } }),
        totalBibleStudies: await db.bibleStudy.count(),
        totalBlogPosts: await db.blogPost.count(),
        totalResources: await db.resource.count(),
        totalEvents: await db.event.count(),
        totalSubscribers: await db.newsletterSubscriber.count(),
        telegramImports: {
          total: await db.telegramImport.count(),
          queued: await db.telegramImport.count({ where: { status: "queued" } }),
          pending: await db.telegramImport.count({ where: { status: "pending" } }),
          processing: await db.telegramImport.count({ where: { status: "processing" } }),
          completed: await db.telegramImport.count({ where: { status: "completed" } }),
          failed: await db.telegramImport.count({ where: { status: "failed" } })
        }
      }
    : adminOverviewFallback.stats;

  const topCards = [
    { label: "Total Lessons", value: stats.totalLessons, icon: BookOpen, accent: "bg-black text-white" },
    { label: "Bible Studies", value: stats.totalBibleStudies, icon: BookText, accent: "bg-[#8B4513] text-white" },
    { label: "Blog Posts", value: stats.totalBlogPosts, icon: BarChart3, accent: "bg-[#CD853F] text-white" },
    { label: "Resources", value: stats.totalResources, icon: Download, accent: "bg-[#343a40] text-white" }
  ] as const;

  const managementCards = [
    { label: "Telegram Imports", href: "/admin/telegram-imports", icon: MessageCircleMore, note: `${stats.telegramImports.total} imports` },
    { label: "Lessons", href: "/admin/lessons", icon: BookOpen, note: `${stats.totalLessons} lessons` },
    { label: "Bible Studies", href: "/admin/bible-studies", icon: BookText, note: `${stats.totalBibleStudies} studies` },
    { label: "Blog Posts", href: "/admin/blog", icon: BarChart3, note: `${stats.totalBlogPosts} articles` },
    { label: "Events", href: "/admin/events", icon: CalendarDays, note: `${stats.totalEvents} events` },
    { label: "Teaching Tips", href: "/admin/teaching-tips", icon: Lightbulb, note: "Editorial guidance" },
    { label: "Backups", href: "/admin/backups", icon: Archive, note: "System snapshots" }
  ] as const;

  const quickCreateCards = [
    {
      title: "Add a new lesson",
      body: "Start from a clean editor and capture age group, classroom flow, and publish state in one pass.",
      href: "/admin/lessons/new",
      icon: <BookOpen size={20} />
    },
    {
      title: "Publish a blog article",
      body: "Keep encouragement, teaching reflection, and premium teacher content moving without friction.",
      href: "/admin/blog/new",
      icon: <BarChart3 size={20} />
    },
    {
      title: "Upload a resource",
      body: "Prepare printables, presentations, and worksheets while the storage layer remains configuration-ready.",
      href: "/admin/resources/new",
      icon: <FileCog size={20} />
    }
  ] as const;

  const launchItems = [
    { label: "Database", value: adminConfigReadiness.database ? "Connected" : "Pending", icon: CheckCircle2 },
    { label: "Supabase", value: adminConfigReadiness.supabase ? "Keys present" : "Not configured", icon: Settings },
    { label: "Users", value: isDatabaseConfigured ? "Live records" : `${stats.totalLessons > 0 ? "Fallback demo" : "Ready to seed"}`, icon: Users }
  ] as const;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Overview"
        title={`${greeting}, Administrator`}
        description="Overview of content, users, and integrations."
        meta={
          <>
            <span className="rounded-full bg-slate-100 px-3 py-2">Published lessons: {stats.publishedLessons}</span>
            <span className="rounded-full bg-slate-100 px-3 py-2">Subscribers: {stats.totalSubscribers}</span>
            <span className="rounded-full bg-slate-100 px-3 py-2">Telegram imports: {stats.telegramImports.total}</span>
          </>
        }
        actions={
          <>
            <Link
              href={"/admin/lessons" as any}
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Manage content
              <ArrowRight size={16} />
            </Link>
            <Link
              href={"/admin/telegram-imports" as any}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
            >
              Telegram console
            </Link>
          </>
        }
      />

      {!adminConfigReadiness.database || !adminConfigReadiness.supabase || !adminConfigReadiness.telegram ? (
        <AdminNotice
          tone="warning"
          title="Configuration required"
          body="Review Settings to complete the remaining service setup."
          action={
            <Link
              href={"/admin/settings" as any}
              className="inline-flex items-center gap-2 rounded-md border border-current/20 bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Open settings
              <ArrowRight size={15} />
            </Link>
          }
        />
      ) : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card) => {
          const tone =
            card.label === "Total Lessons"
              ? "dark"
              : card.label === "Bible Studies"
                ? "amber"
                : card.label === "Blog Posts"
                  ? "blue"
                  : "slate";

          return (
            <AdminKpiCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={<card.icon size={26} />}
              note={card.label === "Resources" ? "Downloads and printables" : undefined}
              tone={tone}
            />
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminPanel title="System Readiness" description="Configuration status for the services that support publishing, access, uploads, and integrations.">
          <AdminChecklist items={adminReadinessSummary} />
        </AdminPanel>

        <AdminPanel title="Quick Pulse" description="Key service and workspace signals at a glance.">
          <div className="grid gap-4">
            {launchItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <AdminPanel title="Platform Management" description="Open the areas used to manage content, users, integrations, and site operations.">
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {managementCards.map((card) => (
              <Link
                key={card.label}
                href={card.href as any}
                className="rounded-[14px] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white"
              >
                <card.icon size={24} className="text-slate-800" />
                <h3 className="mt-4 font-semibold text-slate-900">{card.label}</h3>
                <p className="mt-2 text-sm text-slate-500">{card.note}</p>
              </Link>
            ))}
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title="Telegram Import Status" description="Current queue status for Telegram ingestion and processing.">
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["Queued", stats.telegramImports.queued],
                ["Pending", stats.telegramImports.pending],
                ["Processing", stats.telegramImports.processing],
                ["Completed", stats.telegramImports.completed],
                ["Failed", stats.telegramImports.failed]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-semibold text-slate-900">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title="Recent Activity" description="Recent publishing and integration events.">
            <div className="mt-5 grid gap-3">
              {adminOverviewFallback.activities.map((activity) => (
                <div key={activity.title} className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="font-medium text-slate-900">{activity.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{activity.meta}</p>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {quickCreateCards.map((card) => (
          <AdminActionCard
            key={card.title}
            title={card.title}
            body={card.body}
            icon={card.icon}
            action={
              <Link
                href={card.href as any}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Open editor
                <ArrowRight size={15} />
              </Link>
            }
          />
        ))}
      </section>
    </div>
  );
}
