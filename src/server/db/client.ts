import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

import { PrismaClient } from "@/generated/prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(connectionString);

const adapter = new PrismaPg({
  connectionString:
    connectionString ?? "postgresql://postgres:postgres@localhost:5432/ministry_platform"
});

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
