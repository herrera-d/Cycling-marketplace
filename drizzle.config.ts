import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Carga .env.local (Next) y luego .env como fallback.
config({ path: [".env.local", ".env"] });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
