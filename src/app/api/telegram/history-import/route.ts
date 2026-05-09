import { NextResponse } from "next/server";

import { writeAdminAuditLog } from "@/server/admin/audit-log";
import { requireSystemAdminSession } from "@/server/auth/session";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { parseTelegramHistoryExport } from "@/server/services/telegram-history-import";

export async function POST(request: Request) {
  let session;
  try {
    session = await requireSystemAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A Telegram export JSON file is required." }, { status: 400 });
  }

  try {
    const parsedJson = JSON.parse(await file.text());
    const history = parseTelegramHistoryExport(parsedJson);

    let created = 0;
    let updated = 0;

    for (const record of history.records) {
      const existing = await db.telegramImport.findUnique({
        where: { messageId: record.messageId },
        select: { id: true }
      });

      await db.telegramImport.upsert({
        where: { messageId: record.messageId },
        create: record,
        update: {
          rawContent: record.rawContent,
          status: "pending",
          errorMessage: null
        }
      });

      if (existing) {
        updated += 1;
      } else {
        created += 1;
      }
    }

    await writeAdminAuditLog({
      action: "create",
      entityType: "telegram_history_import",
      metadata: {
        actorEmail: session.email,
        fileName: file.name,
        channelName: history.channelName,
        created,
        updated,
        total: history.records.length
      }
    });

    return NextResponse.json(
      {
        ok: true,
        channelName: history.channelName,
        created,
        updated,
        total: history.records.length
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to import Telegram history.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
