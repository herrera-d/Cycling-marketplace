import { config } from "dotenv";

/**
 * Selección de ambiente para los scripts de base de datos (drizzle-kit, seed).
 *
 * `APP_ENV` es **independiente** de `NODE_ENV`: `NODE_ENV` describe cómo se
 * ejecuta Next, mientras que `APP_ENV` decide **contra qué base de datos**
 * apuntan migraciones y seeds.
 *
 *   development → branch de Neon de desarrollo (default)
 *   staging     → branch de staging
 *   production  → base real; usa variables del entorno, nunca archivos locales
 */
export type AppEnv = "development" | "staging" | "production";

const VALID_APP_ENVS: readonly AppEnv[] = [
  "development",
  "staging",
  "production",
];

export function getAppEnv(): AppEnv {
  const raw = (process.env.APP_ENV ?? "development").trim();
  if ((VALID_APP_ENVS as readonly string[]).includes(raw)) {
    return raw as AppEnv;
  }
  throw new Error(
    `APP_ENV inválido: "${raw}". Valores permitidos: ${VALID_APP_ENVS.join(" | ")}.`,
  );
}

/**
 * Carga los archivos `.env` correspondientes al ambiente.
 *
 * Precedencia (el primero gana, igual que Next): `.env.<APP_ENV>.local` →
 * `.env.local` → `.env`. `dotenv` no pisa variables ya definidas en
 * `process.env`, así que el entorno real siempre gana.
 *
 * En **producción** solo se lee `.env.production.local`, si existe. `.env.local`
 * queda explícitamente fuera: un archivo de desarrollo olvidado no puede llevar
 * una migración de producción a la base equivocada por accidente. En Vercel/CI
 * tampoco existe ningún archivo, así que mandan las variables reales del entorno.
 */
export function loadEnvFiles(appEnv: AppEnv = getAppEnv()): void {
  if (appEnv === "production") {
    config({ path: [".env.production.local"] });
    return;
  }
  config({ path: [`.env.${appEnv}.local`, ".env.local", ".env"] });
}

/** Falla temprano y con un mensaje claro si falta `DATABASE_URL`. */
export function requireDatabaseUrl(appEnv: AppEnv = getAppEnv()): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      `Falta DATABASE_URL para APP_ENV="${appEnv}". ` +
        (appEnv === "production"
          ? "Definila en las variables del entorno (Vercel/CI)."
          : `Configurá .env.${appEnv}.local o .env.local.`),
    );
  }
  return url;
}
