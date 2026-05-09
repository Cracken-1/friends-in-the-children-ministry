import { z } from "zod";

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);

export const lessonInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().max(280).optional(),
  content: z.string().trim().min(20),
  ageGroup: z.string().trim().min(2).max(80),
  className: z.string().trim().max(80).optional(),
  duration: z.number().int().min(5).max(240).optional(),
  difficulty: z.string().trim().max(80).optional(),
  status: contentStatusSchema.default("draft")
});

export const blogPostInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().trim().max(280).optional(),
  content: z.string().trim().min(20),
  status: contentStatusSchema.default("draft"),
  premium: z.boolean().default(false),
  priceCents: z.number().int().min(0).optional()
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().email().max(254)
});

export const paginationSchema = z.object({
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

export type LessonInput = z.infer<typeof lessonInputSchema>;
export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
