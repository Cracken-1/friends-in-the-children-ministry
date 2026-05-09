import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { redirect } from "next/navigation";

import { hasSupabaseAuthEnv } from "@/lib/supabase/config";
import { isSystemAdminRole } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db, isDatabaseConfigured } from "@/server/db/client";

export const ADMIN_SESSION_COOKIE = "sb-access-token";

type AdminSession = {
  sub: string;
  authUserId: string;
  email: string;
  role: UserRole;
  displayName?: string | null;
  mode: "supabase";
};

async function readDatabaseAdmin(email: string) {
  if (!isDatabaseConfigured) {
    return null;
  }

  return db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true
    }
  });
}

export async function getAdminSession() {
  if (!hasSupabaseAuthEnv() || !isDatabaseConfigured) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const localUser = await readDatabaseAdmin(user.email);
  if (!localUser) {
    return null;
  }

  return {
    sub: localUser.id,
    authUserId: user.id,
    email: localUser.email,
    role: localUser.role,
    displayName: localUser.displayName,
    mode: "supabase"
  } satisfies AdminSession;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login" as any);
  }

  return session;
}

export async function requireSystemAdminSession() {
  const session = await requireAdminSession();
  if (!isSystemAdminRole(session.role)) {
    redirect("/admin" as any);
  }

  return session;
}
