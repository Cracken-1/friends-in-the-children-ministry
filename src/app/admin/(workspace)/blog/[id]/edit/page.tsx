import type { BlogPost } from "@/generated/prisma/client";
import { notFound } from "next/navigation";

import { ContentEditorShell } from "@/components/admin/content-editor-shell";
import { AdminEditorFeedback } from "@/components/admin/admin-action-feedback";
import { CheckboxField, DatabaseNotice, Field, FormActions, SelectField, TextareaField } from "@/components/admin/content-form";
import { deleteBlogPostAction, updateBlogPostAction } from "@/server/admin/content-actions";
import { db, isDatabaseConfigured } from "@/server/db/client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const fallbackPosts = {
  "post-1": {
    title: "Keeping Children Engaged During Bible Story Time",
    excerpt: "Practical attention-keeping techniques, transitions, and visual cues for younger classes.",
    content: "Use shorter beats, clearer cues, and more intentional transitions than you think you need.",
    premium: false,
    priceCents: null,
    status: "published"
  },
  "post-2": {
    title: "Building Better Lesson Flow for Multi-Age Groups",
    excerpt: "A premium guide to pacing a mixed-age classroom without losing clarity or momentum.",
    content: "Mixed-age classes work best when the core story stays shared and the depth flexes by age.",
    premium: true,
    priceCents: 15000,
    status: "draft"
  }
} as const;

export default async function EditBlogPostPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const post: Pick<BlogPost, "id" | "title" | "excerpt" | "content" | "premium" | "priceCents" | "status"> | null =
    isDatabaseConfigured
      ? await db.blogPost.findUnique({
          where: { id },
          select: { id: true, title: true, excerpt: true, content: true, premium: true, priceCents: true, status: true }
        })
      : (() => {
          const fallback = fallbackPosts[id as keyof typeof fallbackPosts];
          return fallback ? { id, ...fallback } : null;
        })();

  if (!post) notFound();

  return (
    <ContentEditorShell
      title={`Edit Blog Post: ${post.title}`}
      description="Update article positioning, premium access, and publication status."
      backHref="/admin/blog"
      deleteAction={deleteBlogPostAction.bind(null, id)}
      deleteLabel="Delete article"
    >
      <AdminEditorFeedback entityLabel="Blog post" success={query.success} error={query.error} />
      <DatabaseNotice configured={isDatabaseConfigured} />
      <form action={updateBlogPostAction.bind(null, id)} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Field label="Title" name="title" required defaultValue={post.title} />
          <Field label="Premium price (KES cents)" name="priceCents" type="number" defaultValue={post.priceCents} />
          <SelectField
            label="Status"
            name="status"
            defaultValue={post.status}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Archived", value: "archived" }
            ]}
          />
          <div className="flex items-end">
            <CheckboxField label="Premium article" name="premium" defaultChecked={post.premium} />
          </div>
        </div>
        <TextareaField label="Excerpt" name="excerpt" rows={4} defaultValue={post.excerpt} />
        <TextareaField label="Article content" name="content" rows={14} required defaultValue={post.content} />
        <FormActions submitLabel="Save article" />
      </form>
    </ContentEditorShell>
  );
}
