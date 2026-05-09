import { Download, FileSpreadsheet, FileText, FolderOpen, Presentation, Printer } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/public/page-hero";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const revalidate = 60;

type ResourceCard = {
  id: string;
  title: string;
  description: string;
  fileType: string;
};

const fallbackResources: ResourceCard[] = [
  { id: "resource-1", title: "David and Goliath Worksheet Pack", description: "Printable activities and memory verse sheets.", fileType: "Worksheets" },
  { id: "resource-2", title: "Creation Coloring Pages", description: "Classroom printables for early learners.", fileType: "Printables" },
  { id: "resource-3", title: "Teacher Slide Starter", description: "Presentation-ready notes for lesson delivery.", fileType: "Presentations" },
  { id: "resource-4", title: "Attendance and Follow-Up Tracker", description: "Simple class administration sheet.", fileType: "Planning" }
];

export default async function ResourcesPage() {
  const resources: ResourceCard[] = isDatabaseConfigured
    ? await db.resource.findMany({
        where: { status: "published" },
        orderBy: { updatedAt: "desc" },
        take: 24
      }).then((items: Array<{ id: string; title: string; description: string | null; fileType: string }>) =>
        items.map((item: { id: string; title: string; description: string | null; fileType: string }) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? "Downloadable ministry resource.",
          fileType: item.fileType
        }))
      )
    : fallbackResources;

  const groupedResources = Object.entries(
    resources.reduce<Record<string, ResourceCard[]>>((acc, resource) => {
      const key = resource.fileType || "General Resources";
      acc[key] ??= [];
      acc[key].push(resource);
      return acc;
    }, {})
  );

  const iconByType: Record<string, typeof FileText> = {
    Worksheets: FileText,
    Printables: Printer,
    Presentations: Presentation,
    Planning: FileSpreadsheet
  };

  return (
    <div className="bg-sky-50">
      <PageHero
        eyebrow="Teaching Resources"
        title="Downloadable materials that support real classroom use."
        description="The old resources page grouped materials into practical categories. This rebuild keeps that simplicity while making the browsing experience cleaner and more scannable."
        badges={[
          { icon: <FolderOpen size={16} />, label: `${groupedResources.length} categories` },
          { icon: <Download size={16} />, label: `${resources.length} ready resources` }
        ]}
      />

      <section className="page-shell py-12">
        <div className="grid gap-8">
          {groupedResources.map(([category, items]) => (
            <section key={category}>
              <h2 className="border-b-[3px] border-blue-500 pb-3 text-2xl font-semibold text-blue-900">
                {category}
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                  const Icon = iconByType[category] ?? FileText;
                  return (
                    <article key={item.id} className="flex gap-4 rounded-[14px] bg-white p-5 legacy-shadow">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-red-600">
                        <Icon size={30} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                        <button className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white">
                          <Download size={15} />
                          Download
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-[16px] bg-white p-8 text-center legacy-shadow">
          <h2 className="text-2xl font-semibold text-blue-900">Need More Resources?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Each lesson will also carry lesson-specific downloads once content migration is connected.
          </p>
          <Link
            href="/lessons"
            className="mt-5 inline-flex rounded-md border border-blue-800 px-5 py-3 text-sm font-semibold text-blue-800"
          >
            Browse All Lessons
          </Link>
        </div>
      </section>
    </div>
  );
}
