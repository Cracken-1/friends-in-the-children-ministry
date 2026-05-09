import { NextResponse } from "next/server";

import { paginationSchema } from "@/lib/schemas/content";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { assertRateLimit } from "@/server/security/rate-limit";

export async function GET(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  const rateLimit = await assertRateLimit("public");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const query = paginationSchema.parse(Object.fromEntries(url.searchParams));
  const skip = (query.page - 1) * query.limit;

  const lessons = await db.lesson.findMany({
    where: {
      status: "published",
      OR: query.q
        ? [
            { title: { contains: query.q, mode: "insensitive" } },
            { summary: { contains: query.q, mode: "insensitive" } },
            { content: { contains: query.q, mode: "insensitive" } }
          ]
        : undefined
    },
    orderBy: { updatedAt: "desc" },
    skip,
    take: query.limit
  });

  return NextResponse.json({ data: lessons });
}
