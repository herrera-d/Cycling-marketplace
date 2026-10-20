import { sql } from "drizzle-orm";

import { getAppEnv, loadEnvFiles, requireDatabaseUrl } from "./env";
import { getDb } from "./index";
import { CATEGORIES } from "./reference-data";
import { categories, listings, users } from "./schema";

// Carga el entorno según APP_ENV antes de tocar la base (ver db/env.ts).
loadEnvFiles();

/**
 * Pone **producción en cero** antes del primer despliegue.
 *
 * Borra todas las filas *excepto* `categories`, que son datos de **referencia**
 * (el feed filtra por ellas y el formulario las lista): la app no funciona sin
 * categorías. El contenido de demostración (vendedor demo + anuncios + usuarios
 * de prueba creados al probar el login) no debe existir en producción.
 *
 * Las clases de contenido están duplicadas en los branches `dev` y `staging`
 * (cada branch es una copia del anterior), así que ningún dato se pierde al
 * ejecutar esto sobre `production`.
 *
 * Doble seguro: además de `APP_ENV=production` exige un CONFIRM explícito.
 *
 *   npm run db:clean:prod
 *   # confrirma con: CONFIRM_PRODUCTION_CLEAN=yes
 */
const CLEARABLE_TABLES = [
  "favorites",
  "listing_images",
  "listings",
  "accounts",
  "sessions",
  "verification_tokens",
  "users",
] as const;

async function main() {
  const appEnv = getAppEnv();

  if (appEnv !== "production") {
    throw new Error(
      `Abortado: este script solo actúa sobre producción (APP_ENV=production). ` +
        `Recibiste APP_ENV="${appEnv}".`,
    );
  }
  if (process.env.CONFIRM_PRODUCTION_CLEAN !== "yes") {
    throw new Error(
      "Falta la confirmación explícita. Ejecutá:\n" +
        "  CONFIRM_PRODUCTION_CLEAN=yes npm run db:clean:prod",
    );
  }
  requireDatabaseUrl(appEnv);

  const db = getDb();

  const before = await snapshot();
  console.log("📦 Antes:", format(before));

  console.log("🧹 Vaciando producción (se conserva `categories`)...");
  for (const table of CLEARABLE_TABLES) {
    // Los nombres vienen de la constante de arriba (SQL crudo sin input externo).
    await db.execute(sql.raw(`delete from ${table}`));
    console.log(`   ✓ ${table}`);
  }

  // Garantiza los datos de referencia aunque la base viniera vacía.
  await db
    .insert(categories)
    .values(CATEGORIES)
    .onConflictDoNothing({ target: categories.slug });

  const after = await snapshot();
  console.log("📦 Después:", format(after));

  if (after.listings !== 0 || after.users !== 0) {
    throw new Error(
      "La limpieza no quedó en cero: revisar FKs/RLS antes de continuar.",
    );
  }

  console.log(
    `✅ Production limpia: ${after.categories} categorías de referencia, 0 anuncios, 0 usuarios.`,
  );
}

type Snapshot = {
  listings: number;
  users: number;
  categories: number;
};

async function snapshot(): Promise<Snapshot> {
  const db = getDb();
  const [l, u, c] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(listings),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(users),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(categories),
  ]);
  return { listings: l[0]?.n ?? 0, users: u[0]?.n ?? 0, categories: c[0]?.n ?? 0 };
}

function format(s: Snapshot): string {
  return `${s.listings} anuncios · ${s.users} usuarios · ${s.categories} categorías`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en la limpieza:", error);
    process.exit(1);
  });
