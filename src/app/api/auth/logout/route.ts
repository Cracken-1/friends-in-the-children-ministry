import { NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route";
import { writeAdminAuditLog } from "@/server/admin/audit-log";
import { getAdminSession } from "@/server/auth/session";

export async function POST(request: Request) {
  const session = await getAdminSession();
  const contentType = request.headers.get("content-type") ?? "";
  const isFormPost =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  if (session) {
    await writeAdminAuditLog({
      action: "logout",
      entityType: "auth_session",
      entityId: session.sub,
      metadata: { email: session.email, mode: session.mode, role: session.role }
    });
  }

  const { supabase, applySupabaseCookies } = await createSupabaseRouteHandlerClient();
  await supabase.auth.signOut();

  if (isFormPost) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
    return applySupabaseCookies(response);
  }

  const response = NextResponse.json({ ok: true, message: "Signed out." }, { status: 200 });
  return applySupabaseCookies(response);
}
