import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

import { db } from "@/server/db/client";

export const createTRPCContext = async () => {
  return {
    db,
    user: null as { id: string; role: "admin" | "super_admin" } | null
  };
};

type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof z.ZodError ? error.cause.flatten() : null
      }
    };
  }
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({ ctx: { ...ctx, user: ctx.user } });
});
