import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { createClient } from "@supabase/supabase-js";

import { getSupabaseServiceRoleKey, getSupabaseUrl, hasSupabaseAuthEnv } from "@/lib/supabase/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseAdmin =
  hasSupabaseAuthEnv() &&
  Boolean(supabaseUrl && supabaseUrl.trim()) &&
  Boolean(serviceRoleKey && serviceRoleKey.trim()) &&
  !String(supabaseUrl).includes("example") &&
  !String(serviceRoleKey).includes("replace-me");

export function getSupabaseAdminClient() {
  if (!hasSupabaseAdmin) {
    return null;
  }

  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

type ManagedAdminUser = {
  email: string;
  password?: string;
  displayName?: string | null;
  role: UserRole;
};

function buildAdminMetadata(input: ManagedAdminUser) {
  return {
    role: input.role,
    display_name: input.displayName ?? null
  };
}

async function findSupabaseUserByEmail(email: string) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return null;
  }

  let page = 1;
  while (page <= 10) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw error;
    }

    const user = data.users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());
    if (user) {
      return user;
    }

    if (!data.users.length || data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

export async function createOrUpdateSupabaseAdminUser(input: ManagedAdminUser) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const existingUser = await findSupabaseUserByEmail(input.email);
  if (existingUser) {
    const { data, error } = await client.auth.admin.updateUserById(existingUser.id, {
      email: input.email,
      ...(input.password ? { password: input.password } : {}),
      email_confirm: true,
      user_metadata: buildAdminMetadata(input),
      app_metadata: { role: input.role }
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await client.auth.admin.createUser({
    email: input.email,
    ...(input.password ? { password: input.password } : {}),
    email_confirm: true,
    user_metadata: buildAdminMetadata(input),
    app_metadata: { role: input.role }
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function updateSupabaseAdminUserByEmail(
  currentEmail: string,
  input: ManagedAdminUser
) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const existingUser = await findSupabaseUserByEmail(currentEmail);
  if (!existingUser) {
    return null;
  }

  const { data, error } = await client.auth.admin.updateUserById(existingUser.id, {
    email: input.email,
    ...(input.password ? { password: input.password } : {}),
    email_confirm: true,
    user_metadata: buildAdminMetadata(input),
    app_metadata: { role: input.role }
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function deleteSupabaseAdminUserByEmail(email: string) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const existingUser = await findSupabaseUserByEmail(email);
  if (!existingUser) {
    return null;
  }

  const { data, error } = await client.auth.admin.deleteUser(existingUser.id);
  if (error) {
    throw error;
  }

  return data.user;
}
