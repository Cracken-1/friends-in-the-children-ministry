import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseAuthEnv } from "@/lib/supabase/config";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

const publicAdminRoutes = new Set(["/admin/login"]);

export async function proxy(request: NextRequest) {
  if (publicAdminRoutes.has(request.nextUrl.pathname)) {
    if (!hasSupabaseAuthEnv()) {
      return NextResponse.next();
    }

    const { response, user } = await updateSupabaseSession(request);
    if (user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return response;
  }

  if (!hasSupabaseAuthEnv()) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const { response, user } = await updateSupabaseSession(request);
  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "session-required");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"]
};
