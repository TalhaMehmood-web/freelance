import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  // Tell Prisma where the schema moved to
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // This pulls from your .env file
    url: env("DATABASE_URL"),
  },
});
