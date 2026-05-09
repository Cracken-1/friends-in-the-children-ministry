import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { writeAdminAuditLog } from "@/server/admin/audit-log";
import { db, isDatabaseConfigured } from "@/server/db/client";
import { assertRateLimit } from "@/server/security/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(256)
});

function isFormPost(contentType: string) {
  return (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  );
}

function buildErrorResponse(request: Request, contentType: string, status: number, error: string) {
  if (isFormPost(contentType)) {
    const response = NextResponse.redirect(new URL(`/admin/login?error=${error}`, request.url), {
      status: 303
    });
    return response;
  }

  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  const rateLimit = await assertRateLimit("adminLogin");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isDatabaseConfigured) {
    return buildErrorResponse(request, request.headers.get("content-type") ?? "", 503, "database-not-configured");
  }

  const contentType = request.headers.get("content-type") ?? "";
  const body: unknown = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries(await request.formData());
  const input = loginSchema.parse(body);

  const { supabase, applySupabaseCookies } = await createSupabaseRouteHandlerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.toLowerCase(),
    password: input.password
  });

  if (error || !data.user?.email) {
    return buildErrorResponse(request, contentType, 401, "invalid-credentials");
  }

  const localUser = await db.user.findUnique({
    where: { email: data.user.email.toLowerCase() },
    select: { id: true, email: true, role: true }
  });

  if (!localUser) {
    await supabase.auth.signOut();
    const deniedResponse = buildErrorResponse(request, contentType, 403, "access-denied");
    return applySupabaseCookies(deniedResponse);
  }

  await writeAdminAuditLog({
    action: "login",
    entityType: "auth_session",
    entityId: localUser.id,
    metadata: { email: localUser.email, mode: "supabase", role: localUser.role }
  });

  if (isFormPost(contentType)) {
    const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
    return applySupabaseCookies(response);
  }

  const response = NextResponse.json(
    {
      ok: true,
      email: localUser.email,
      role: localUser.role,
      message: "Signed in."
    },
    { status: 200 }
  );

  return applySupabaseCookies(response);
}
