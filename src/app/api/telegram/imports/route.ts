import { NextResponse } from "next/server";

import { adminTelegramFallback } from "@/server/admin/mock-data";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { assertRateLimit } from "@/server/security/rate-limit";

export async function GET() {
  const rateLimit = await assertRateLimit("telegram");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isDatabaseConfigured) {
    return NextResponse.json({
      imports: adminTelegramFallback.imports,
      storage: "fallback"
    });
  }

  const imports = await db.telegramImport.findMany({
    orderBy: { createdAt: "desc" },
    take: 25
  });

  return NextResponse.json({
    imports,
    storage: "database"
  });
}
