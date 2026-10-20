import { defineConfig } from "drizzle-kit";

import { loadEnvFiles, requireDatabaseUrl } from "./db/env";

// Carga el entorno según APP_ENV (development | staging | production):
// `.env.<APP_ENV>.local` → `.env.local` → `.env`. En producción no toca archivos.
loadEnvFiles();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: requireDatabaseUrl(),
  },
  strict: true,
  verbose: true,
});
