import type { BlogPost } from "@/generated/prisma/client";
import type { Route } from "next";
import { Crown, PenSquare, Plus } from "lucide-react";
import Link from "next/link";

import { AdminListFeedback } from "@/components/admin/admin-action-feedback";
import { AdminEmptyState, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";
import { adminFallbackPosts } from "@/server/admin/mock-data";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminBlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const posts: Array<
    Pick<BlogPost, "id" | "title" | "premium" | "status" | "updatedAt">
  > | typeof adminFallbackPosts = isDatabaseConfigured
    ? await db.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 50 })
    : adminFallbackPosts;

  return (
    <div className="space-y-8">
      <AdminListFeedback entityLabel="Blog post" success={params.success} error={params.error} />
      <AdminPageHeader
        eyebrow="Editorial"
        title="Blog Posts"
        description="A cleaner editorial surface for articles, premium guides, and teacher encouragement pieces."
        actions={
          <Link href={"/admin/blog/new" as any} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            <Plus size={16} />
            New article
          </Link>
        }
      />

      <AdminPanel title="Editorial Queue" description="Premium and free content, staged the way an editor expects to scan it.">
        {posts.length ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col gap-4 rounded-[16px] border border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    <span className={post.premium ? "text-amber-600" : "text-blue-700"}>
                      {post.premium ? "Premium guide" : "Free article"}
                    </span>
                    {"updatedAt" in post ? <span>Recently updated</span> : <span>Editorial sample</span>}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{post.title}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {post.premium ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      <Crown size={14} />
                      Premium
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                      post.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {post.status}
                  </span>
                  <Link href={`/admin/blog/${post.id}/edit` as any} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900">
                    <PenSquare size={15} />
                    Review
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title="No blog posts yet"
            body="Create the first article and it will appear here with publish state, premium status, and editorial controls."
          />
        )}
      </AdminPanel>
    </div>
  );
}
