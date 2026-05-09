import { z } from "zod";

import { blogPostInputSchema, lessonInputSchema } from "@/lib/schemas/content";
import { adminProcedure, createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const contentRouter = createTRPCRouter({
  listLessons: publicProcedure.query(({ ctx }) => {
    return ctx.db.lesson.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50
    });
  }),
  createLesson: adminProcedure.input(lessonInputSchema).mutation(({ ctx, input }) => {
    return ctx.db.lesson.create({ data: input });
  }),
  updateLesson: adminProcedure
    .input(z.object({ id: z.string().uuid(), data: lessonInputSchema.partial() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.lesson.update({ where: { id: input.id }, data: input.data });
    }),
  listBlogPosts: publicProcedure.query(({ ctx }) => {
    return ctx.db.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50
    });
  }),
  createBlogPost: adminProcedure.input(blogPostInputSchema).mutation(({ ctx, input }) => {
    return ctx.db.blogPost.create({ data: input });
  }),
  updateBlogPost: adminProcedure
    .input(z.object({ id: z.string().uuid(), data: blogPostInputSchema.partial() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.blogPost.update({ where: { id: input.id }, data: input.data });
    })
});
