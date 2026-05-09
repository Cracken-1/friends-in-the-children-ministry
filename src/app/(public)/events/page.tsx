import type { Event } from "@/generated/prisma/client";
import { CalendarDays, MapPin } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

const fallbackEvents = [
  {
    id: "event-1",
    title: "Teachers Prayer and Planning Morning",
    description: "A shared planning and prayer session for the upcoming month of children's ministry teaching.",
    startsAt: new Date("2026-06-14"),
    location: "Nairobi Central Fellowship"
  },
  {
    id: "event-2",
    title: "Holiday Bible Club Orientation",
    description: "A practical orientation for volunteers preparing to lead holiday Bible club sessions.",
    startsAt: new Date("2026-07-02"),
    location: "Community Hall"
  }
] satisfies Array<Pick<Event, "id" | "title" | "description" | "startsAt" | "location">>;

export default async function EventsPage() {
  const events: Array<Pick<Event, "id" | "title" | "description" | "startsAt" | "location">> = isDatabaseConfigured
    ? await db.event.findMany({
        where: { status: "published" },
        orderBy: { startsAt: "asc" },
        take: 24
      })
    : fallbackEvents;

  return (
    <div className="bg-sky-50">
      <PageHero
        eyebrow="Events"
        title="Stay aligned around ministry gatherings and key dates."
        description="The public events area is being rebuilt as a clear, parent-and-teacher friendly calendar surface."
        badges={[{ icon: <CalendarDays size={16} />, label: `${events.length} upcoming events` }]}
      />

      <section className="page-shell py-12">
        <div className="grid gap-5">
          {events.map((event) => (
            <article key={event.id} className="rounded-[16px] bg-white p-6 legacy-shadow">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                {formatDate(event.startsAt)}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{event.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{event.description}</p>
              {event.location ? (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-blue-900">
                  <MapPin size={15} />
                  {event.location}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
