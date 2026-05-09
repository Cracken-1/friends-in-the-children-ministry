import type { Route } from "next";
import { Download, FileBadge2, Star } from "lucide-react";
import Link from "next/link";

import { AdminListFeedback } from "@/components/admin/admin-action-feedback";
import { AdminEmptyState, AdminKpiCard, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { adminFallbackResources } from "@/server/admin/mock-data";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const dynamic = "force-dynamic";

type AdminResourceRow = {
  id: string;
  title: string;
  fileType: string;
  status: string;
  description: string;
  featured: boolean;
  downloads: number;
  size?: string;
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminResourcesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const resources: AdminResourceRow[] = isDatabaseConfigured
    ? await db.resource.findMany({ orderBy: { updatedAt: "desc" }, take: 50 })
        .then((items: Array<{ id: string; title: string; fileType: string; status: string; description: string | null }>) =>
          items.map((resource: { id: string; title: string; fileType: string; status: string; description: string | null }) => ({
            id: resource.id,
            title: resource.title,
            fileType: resource.fileType,
            status: resource.status,
            description: resource.description ?? "Downloadable ministry resource.",
            featured: false,
            downloads: 0
          }))
        )
    : adminFallbackResources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        fileType: resource.fileType,
        status: "published",
        description: resource.type,
        featured: resource.featured,
        downloads: resource.downloads,
        size: resource.size
      }));

  const featuredCount = resources.filter((resource) => resource.featured).length;
  const totalDownloads = resources.reduce((sum, resource) => sum + resource.downloads, 0);

  return (
    <div className="space-y-8">
      <AdminListFeedback entityLabel="Resource" success={params.success} error={params.error} />
      <AdminPageHeader
        eyebrow="Downloads"
        title="Resources"
        description="The old resources screen was useful because it stayed practical. This version keeps that spirit while making file health and category coverage easier to scan."
        actions={
          <Link href={"/admin/resources/new" as any} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            New resource
          </Link>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <AdminKpiCard label="Total resources" value={resources.length} icon={<FileBadge2 size={24} />} tone="dark" />
        <AdminKpiCard label="Featured files" value={featuredCount} icon={<Star size={24} />} tone="amber" />
        <AdminKpiCard label="Tracked downloads" value={totalDownloads} icon={<Download size={24} />} tone="green" />
      </div>

      <AdminPanel title="Resource Catalogue" description="Each row is designed around what an editor or admin actually needs to inspect before publishing or replacing a file.">
        {resources.length ? (
          <div className="grid gap-4">
            {resources.map((resource) => {
              const status = resource.status;

              return (
                <article
                  key={resource.id}
                  className="grid gap-4 rounded-[16px] border border-slate-200 p-5 lg:grid-cols-[1fr_0.5fr_0.35fr]"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{resource.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      <span>{resource.fileType}</span>
                      {resource.size ? <span>{resource.size}</span> : null}
                      <span>{resource.downloads} downloads</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{resource.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                        status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {status}
                    </span>
                    {resource.featured ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-start lg:justify-end">
                    <Link href={`/admin/resources/${resource.id}/edit` as any} className="inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                      Edit resource
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <AdminEmptyState
            title="No resources uploaded"
            body="Upload support is now wired for local fallback storage, so this area can start handling files even before Supabase buckets are finalized."
          />
        )}
      </AdminPanel>
    </div>
  );
}
