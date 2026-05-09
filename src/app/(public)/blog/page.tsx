import type { BlogPost } from "@/generated/prisma/client";
import type { Route } from "next";
import { BookOpenText, Crown, Lightbulb, Tag, Users } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/public/page-hero";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const revalidate = 60;

const fallbackPosts = [
  {
    id: "blog-1",
    title: "Keeping Children Engaged During Bible Story Time",
    excerpt: "Practical attention-keeping techniques, transitions, and visual cues for younger classes.",
    premium: false
  },
  {
    id: "blog-2",
    title: "Building Better Lesson Flow for Multi-Age Groups",
    excerpt: "A premium guide to pacing a mixed-age classroom without losing clarity or momentum.",
    premium: true
  },
  {
    id: "blog-3",
    title: "How to Use Discussion Questions That Children Actually Answer",
    excerpt: "A field-tested approach to making reflection time more natural and less intimidating.",
    premium: false
  }
] satisfies Array<Pick<BlogPost, "id" | "title" | "excerpt" | "premium">>;

export default async function BlogPage() {
  const posts: Array<Pick<BlogPost, "id" | "title" | "excerpt" | "premium">> = isDatabaseConfigured
    ? await db.blogPost.findMany({
        where: { status: "published" },
        orderBy: { updatedAt: "desc" },
        take: 24
      })
    : fallbackPosts;

  return (
    <div className="bg-sky-50">
      <PageHero
        eyebrow="Teaching Blog"
        title="Teaching tips, classroom wisdom, and ministry encouragement."
        description="The old site's blog was practical and teacher-facing. This rebuild keeps that tone while giving articles cleaner presentation and premium content room to breathe."
        badges={[
          { icon: <Lightbulb size={16} />, label: "Practical teaching advice" },
          { icon: <Users size={16} />, label: "Built for teachers" },
          { icon: <BookOpenText size={16} />, label: `${posts.length} current articles` }
        ]}
      />

      <section className="page-shell py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Classroom Flow", count: "12 articles", icon: Lightbulb },
            { label: "Lesson Planning", count: "9 articles", icon: BookOpenText },
            { label: "Parent Connection", count: "6 articles", icon: Users },
            { label: "Premium Guides", count: "4 articles", icon: Crown }
          ].map((category) => (
            <article key={category.label} className="rounded-[14px] bg-white p-5 text-center legacy-shadow">
              <category.icon className="mx-auto text-blue-500" size={28} />
              <h2 className="mt-3 text-lg font-semibold">{category.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{category.count}</p>
            </article>
          ))}
        </div>

        <h2 className="mt-12 text-3xl font-semibold text-blue-900">Latest Articles</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="relative rounded-[16px] bg-white p-6 legacy-shadow">
              {post.premium ? (
                <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-slate-900">
                  <Crown size={13} />
                  Premium
                </span>
              ) : null}
              <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <span className="inline-flex items-center gap-1">
                  <Tag size={13} />
                  {post.premium ? "Paid guide" : "Free article"}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold">
                <Link href={`/blog/${post.id}` as Route}>{post.title}</Link>
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(post.premium
                  ? ["Deep planning help", "Team training value", "Premium access"]
                  : ["Quick read", "Teacher encouragement", "Immediately usable"]
                ).map((chip) => (
                  <span key={chip} className="rounded-full bg-sky-100 px-3 py-2 text-xs font-semibold text-blue-900">
                    {chip}
                  </span>
                ))}
              </div>
              <Link
                href={`/blog/${post.id}` as Route}
                className={`mt-6 inline-flex rounded-md px-4 py-3 text-sm font-semibold ${
                  post.premium ? "bg-amber-300 text-slate-900" : "border border-blue-800 text-blue-800"
                }`}
              >
                {post.premium ? "Unlock Premium" : "Read More"}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
