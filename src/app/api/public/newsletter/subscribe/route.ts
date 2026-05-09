import { createHash, randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { newsletterSubscribeSchema } from "@/lib/schemas/content";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { assertRateLimit } from "@/server/security/rate-limit";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  const rateLimit = await assertRateLimit("newsletter");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const body: unknown = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries(await request.formData());
  const input = newsletterSubscribeSchema.parse(body);
  const token = randomBytes(32).toString("hex");

  await db.newsletterSubscriber.upsert({
    where: { email: input.email },
    create: {
      email: input.email,
      status: "pending",
      tokenHash: hashToken(token)
    },
    update: {
      status: "pending",
      tokenHash: hashToken(token)
    }
  });

  return NextResponse.json(
    {
      ok: true,
      message: "Subscription request received. Confirmation email delivery is handled by the email worker."
    },
    { status: 202 }
  );
}
