import { NextResponse } from "next/server";

import { telegramConfigureSchema } from "@/lib/schemas/telegram";
import { assertRateLimit } from "@/server/security/rate-limit";

export async function POST(request: Request) {
  const rateLimit = await assertRateLimit("telegram");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = telegramConfigureSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: true,
      mode: parsed.data.mode,
      message:
        "Telegram configuration is valid. Persisting settings and registering the webhook should be connected to protected admin actions next."
    },
    { status: 202 }
  );
}
