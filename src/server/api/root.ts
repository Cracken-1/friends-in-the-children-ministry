import { contentRouter } from "@/server/api/routers/content";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  content: contentRouter
});

export type AppRouter = typeof appRouter;
