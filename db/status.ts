import { sql } from "drizzle-orm";

import { getAppEnv, loadEnvFiles, requireDatabaseUrl } from "./env";
import { getDb } from "./index";
import {
  categories,
  favorites,
  listingImages,
  listings,
  users,
} from "./schema";

// Carga el entorno según APP_ENV antes de tocar la base (ver db/env.ts).
loadEnvFiles();

/**
 * Estado rápido de la base de un ambiente (**solo lectura**).
 *
 *   npm run db:status
 *   APP_ENV=staging    npm run db:status
 *   APP_ENV=production npm run db:status
 *
 * Muestra a qué host apunta cada archivo `.env` y cuántas filas hay. Sirve
 * para verificar que migraciones y seeds vayan a la base correcta antes de
 * ejecutarlos.
 *
 * Alcance esperado:
 *   development / staging → datos demo (29 anuncios, usuarios de prueba)
 *   production            → 0 anuncios · 0 usuarios · solo categorías
 */
async function main() {
  const appEnv = getAppEnv();
  const url = requireDatabaseUrl(appEnv);
  const host = url.match(/@([^/]+)/)?.[1] ?? "(desconocido)";

  const db = getDb();
  const count = (rows: Array<{ n: number }>) => rows[0]?.n ?? 0;

  const [anuncios, usuarios, favoritos, imagenes, cats] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(listings),
    db.select({ n: sql<number>`count(*)::int` }).from(users),
    db.select({ n: sql<number>`count(*)::int` }).from(favorites),
    db.select({ n: sql<number>`count(*)::int` }).from(listingImages),
    db.select({ n: sql<number>`count(*)::int` }).from(categories),
  ]);

  console.log(`🎯 APP_ENV=${appEnv}`);
  console.log(`   host = ${host}`);
  console.log(
    `   anuncios=${count(anuncios)} · usuarios=${count(usuarios)} · ` +
      `favoritos=${count(favoritos)} · imágenes=${count(imagenes)} · ` +
      `categorías=${count(cats)}`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌", error instanceof Error ? error.message : error);
    process.exit(1);
  });
