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
    const imports = adminTelegramFallback.imports;

    return NextResponse.json({
      total: imports.length,
      queued: imports.filter((item) => String(item.status) === "queued").length,
      pending: imports.filter((item) => String(item.status) === "pending").length,
      processing: imports.filter((item) => String(item.status) === "processing").length,
      completed: imports.filter((item) => String(item.status) === "completed").length,
      failed: imports.filter((item) => String(item.status) === "failed").length,
      mode: adminTelegramFallback.mode,
      storage: "fallback"
    });
  }

  const [total, queued, pending, processing, completed, failed] = await Promise.all([
    db.telegramImport.count(),
    db.telegramImport.count({ where: { status: "queued" } }),
    db.telegramImport.count({ where: { status: "pending" } }),
    db.telegramImport.count({ where: { status: "processing" } }),
    db.telegramImport.count({ where: { status: "completed" } }),
    db.telegramImport.count({ where: { status: "failed" } })
  ]);

  return NextResponse.json({
    total,
    queued,
    pending,
    processing,
    completed,
    failed,
    mode: process.env.TELEGRAM_IMPORT_MODE ?? "webhook",
    storage: "database"
  });
}
