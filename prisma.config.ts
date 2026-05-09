import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env.local" });
dotenv.config();

const realDatasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const command = process.argv.join(" ");

if (!realDatasourceUrl && command.includes("migrate")) {
  throw new Error("Set DIRECT_URL or DATABASE_URL in .env.local before running Prisma migrations.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: realDatasourceUrl ?? "postgresql://postgres:postgres@localhost:5432/ministry_platform"
  }
});
