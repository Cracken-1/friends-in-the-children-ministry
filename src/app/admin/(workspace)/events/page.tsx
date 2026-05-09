import type { Event } from "@/generated/prisma/client";
import type { Route } from "next";
import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

import { AdminListFeedback } from "@/components/admin/admin-action-feedback";
import { AdminEmptyState, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { adminFallbackEvents } from "@/server/admin/mock-data";
import { formatDate } from "@/lib/utils";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const events: Array<
    Pick<Event, "id" | "title" | "startsAt" | "location" | "status">
  > | typeof adminFallbackEvents = isDatabaseConfigured
    ? await db.event.findMany({ orderBy: { startsAt: "asc" }, take: 50 })
    : adminFallbackEvents;

  return (
    <div className="space-y-8">
      <AdminListFeedback entityLabel="Event" success={params.success} error={params.error} />
      <AdminPageHeader
        eyebrow="Calendar"
        title="Events"
        description="Track ministry gatherings, volunteer orientation, and teacher planning moments without burying the key logistics."
        actions={
          <Link href={"/admin/events/new" as any} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            New event
          </Link>
        }
      />

      <AdminPanel title="Upcoming schedule" description="A calm, operational calendar view modelled after the old portal but easier to scan.">
        {events.length ? (
          <div className="grid gap-4">
            {events.map((event) => (
              <article key={event.id} className="rounded-[16px] border border-slate-200 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-blue-700">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={15} />
                        {"startsAt" in event ? formatDate(event.startsAt) : event.date}
                      </span>
                      {"location" in event && event.location ? (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <MapPin size={15} />
                          {event.location}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">{event.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                        event.status === "published" || event.status === "upcoming"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {event.status}
                    </span>
                    <Link href={`/admin/events/${event.id}/edit` as any} className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                      Edit
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No upcoming events"
            body="Event records will appear here with date, location, and visibility status as soon as they are created."
          />
        )}
      </AdminPanel>
    </div>
  );
}
