import type { BlogPost } from "@/generated/prisma/client";
import { Crown, FileText, HeartHandshake, NotebookPen, Users } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { db, isDatabaseConfigured } from "@/server/db/client";

type BlogPageProps = {
  params: Promise<{ id: string }>;
};

const fallbackPosts = {
  "blog-1": {
    title: "Keeping Children Engaged During Bible Story Time",
    excerpt: "Practical attention-keeping techniques, transitions, and visual cues for younger classes.",
    premium: false,
    content:
      "Strong Bible teaching moments usually come from simple structure, repeated rhythms, and shorter transitions than we think we need. This article outlines a teacher-friendly pattern that keeps children with you."
  },
  "blog-2": {
    title: "Building Better Lesson Flow for Multi-Age Groups",
    excerpt: "A premium guide to pacing a mixed-age classroom without losing clarity or momentum.",
    premium: true,
    content:
      "Mixed-age teaching works best when the core story stays shared while activity depth flexes by age. In the rebuilt platform this premium content area will later connect to payments and access tokens."
  }
} satisfies Record<string, Pick<BlogPost, "title" | "excerpt" | "premium" | "content">>;

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { id } = await params;

  const post =
    isDatabaseConfigured
      ? await db.blogPost.findUnique({ where: { id } })
      : fallbackPosts[id as keyof typeof fallbackPosts] ?? fallbackPosts["blog-1"];

  return (
    <div className="bg-sky-50">
      <PageHero
        eyebrow="Article"
        title={post?.title ?? "Teaching Article"}
        description={post?.excerpt ?? "A practical article for Sunday school teachers."}
        badges={[
          {
            icon: post?.premium ? <Crown size={16} /> : <FileText size={16} />,
            label: post?.premium ? "Premium article" : "Free article"
          }
        ]}
      />

      <section className="page-shell py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <article className="rounded-[18px] bg-white p-8 legacy-shadow">
            <p className="text-base leading-8 text-muted-foreground">
              {post?.content ?? "Article content will appear here once the live records are connected."}
            </p>
            <div className="mt-8 rounded-[16px] bg-sky-50 p-6">
              <h2 className="text-2xl font-semibold text-slate-900">Why this kind of article matters</h2>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-muted-foreground">
                <p>It helps teachers prepare with more confidence and less last-minute stress.</p>
                <p>It turns ministry knowledge into something reusable for the whole team.</p>
                <p>It gives the platform a more pastoral voice, not just a library feel.</p>
              </div>
            </div>
          </article>

          <aside className="rounded-[18px] bg-white p-6 legacy-shadow">
            <h2 className="text-xl font-semibold text-slate-900">Article notes</h2>
            <div className="mt-5 grid gap-3">
              {[
                { icon: <NotebookPen size={16} />, label: "Prepared for classroom use" },
                { icon: <Users size={16} />, label: "Written with teachers in mind" },
                { icon: <HeartHandshake size={16} />, label: "Encouragement and practical guidance" }
              ].map((item) => (
                <div key={item.label} className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <div className="mt-0.5 text-blue-700">{item.icon}</div>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
