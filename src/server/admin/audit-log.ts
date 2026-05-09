import "server-only";

import { Prisma } from "@/generated/prisma/client";
import type { AuditAction } from "@/generated/prisma/enums";

import { getAdminSession } from "@/server/auth/session";
import { db, isDatabaseConfigured } from "@/server/db/client";

type AuditInput = {
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue | null;
};

export async function writeAdminAuditLog(input: AuditInput) {
  if (!isDatabaseConfigured) {
    return;
  }

  const session = await getAdminSession();
  const actorId = session?.sub ?? null;

  await db.adminAuditLog.create({
    data: {
      actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: input.metadata ?? Prisma.JsonNull
    }
  });
}
