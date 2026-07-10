import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  // D1 uses SQLite dialect — Drizzle-generated SQL is compatible.
  // Verify datetime columns: D1 stores TEXT as ISO 8601 strings by default.
});
