import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const { Client } = pg;

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Set DIRECT_URL or DATABASE_URL before seeding.");
  process.exit(1);
}

const client = new Client({ connectionString });

const adminEmail = "admin@test.com";
const adminPassword = "admin";
const passwordHash = await bcrypt.hash(adminPassword, 10);

async function syncSupabaseAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes("example") || serviceRoleKey.includes("replace-me")) {
    return false;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    throw error;
  }

  const existingUser = data.users.find((user) => user.email?.toLowerCase() === adminEmail);

  if (existingUser) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { display_name: "Lead Administrator", role: "super_admin" },
      app_metadata: { role: "super_admin" }
    });

    if (updateError) {
      throw updateError;
    }

    return true;
  }

  const { error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { display_name: "Lead Administrator", role: "super_admin" },
    app_metadata: { role: "super_admin" }
  });

  if (createError) {
    throw createError;
  }

  return true;
}

try {
  await client.connect();

  await client.query(
    `
      INSERT INTO users (id, email, role, password_hash, display_name, created_at, updated_at)
      VALUES ($1, $2, 'super_admin', $3, $4, NOW(), NOW())
      ON CONFLICT (email)
      DO UPDATE SET
        role = EXCLUDED.role,
        password_hash = EXCLUDED.password_hash,
        display_name = EXCLUDED.display_name,
        updated_at = NOW()
    `,
    [randomUUID(), adminEmail, passwordHash, "Lead Administrator"]
  );

  const syncedSupabase = await syncSupabaseAdminUser();
  console.log(`Seeded admin user: ${adminEmail}`);
  if (syncedSupabase) {
    console.log("Synced admin user to Supabase Auth.");
  }
} catch (error) {
  console.error("Failed to seed admin user.");
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end();
}
