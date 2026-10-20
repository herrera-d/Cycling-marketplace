import { eq, inArray, sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import { DEMO_LISTINGS, DEMO_SELLER_ID } from "./demo-listings";
import { getAppEnv, loadEnvFiles, requireDatabaseUrl, type AppEnv } from "./env";
import { getDb } from "./index";
import { CATEGORIES } from "./reference-data";
import * as schema from "./schema";
import {
  categories,
  listingImages,
  listings,
  users,
} from "./schema";

// Carga el entorno según APP_ENV antes de tocar la base (ver db/env.ts).
loadEnvFiles();

/**
 * Qué datos sembrar:
 *   - `categories`: solo datos de referencia (categorías). Seguro en cualquier
 *     ambiente, incluida producción (son idempotentes y la app los necesita).
 *   - `demo`: vendedor + anuncios de demostración. **Bloqueado en producción**.
 *   - `all`: ambos (default; uso de desarrollo).
 */
type SeedMode = "all" | "categories" | "demo";

function getSeedMode(): SeedMode {
  const raw = (process.env.SEED_ONLY ?? "all").trim();
  if (raw === "all" || raw === "categories" || raw === "demo") return raw;
  throw new Error(`SEED_ONLY inválido: "${raw}". Valores: all | categories | demo.`);
}

/**
 * La base de producción debe arrancar **limpia** de contenido de demostración.
 * Por eso el seed de demo se niega a correr con `APP_ENV=production`.
 */
function assertDemoAllowed(appEnv: AppEnv, mode: SeedMode): void {
  const runsDemo = mode === "all" || mode === "demo";
  if (runsDemo && appEnv === "production") {
    throw new Error(
      "Bloqueado: el seed de demo no corre en producción. " +
        "La base de producción arranca limpia (solo datos de referencia). " +
        "Usá APP_ENV=development | staging, o SEED_ONLY=categories.",
    );
  }
}

type Database = NeonHttpDatabase<typeof schema>;

async function seedCategories(db: Database): Promise<void> {
  console.log(`🌱 Sembrando ${CATEGORIES.length} categorías...`);
  await db
    .insert(categories)
    .values(CATEGORIES)
    .onConflictDoNothing({ target: categories.slug });
}

async function seedDemo(
  db: Database,
  categoryIdBySlug: Map<string, number>,
): Promise<void> {
  console.log("👤 Asegurando vendedor de demostración...");
  await db
    .insert(users)
    .values({
      id: DEMO_SELLER_ID,
      name: "BiciMarket Demo",
      email: "demo@bicimarket.local",
      image: null,
    })
    .onConflictDoNothing({ target: users.id });

  const now = Date.now();
  const listingValues = DEMO_LISTINGS.flatMap((listing) => {
    const categoryId = categoryIdBySlug.get(listing.categorySlug);
    if (!categoryId) return [];
    const createdAt = new Date(now - listing.ageHours * 3_600_000);
    return [
      {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        priceCents: listing.priceCents,
        currency: listing.currency,
        categoryId,
        condition: listing.condition,
        brand: listing.brand,
        size: listing.size,
        location: listing.location,
        status: "active" as const,
        sellerId: DEMO_SELLER_ID,
        createdAt,
        updatedAt: createdAt,
      },
    ];
  });

  console.log(`🌱 Sembrando ${listingValues.length} anuncios demo...`);
  await db
    .insert(listings)
    .values(listingValues)
    .onConflictDoNothing({ target: listings.id });

  // Imágenes de la galería (PLAN §5.4). La posición 0 es la del propio anuncio
  // (la que usa el feed) y se completan hasta 4 con imágenes **distintas**:
  // primero las de su categoría y después el resto del catálogo demo. Los datos
  // de demostración reutilizan fotos, así que sin deduplicar la galería
  // mostraría la misma imagen repetida.
  const distinctByCategory = new Map<string, string[]>();
  for (const listing of DEMO_LISTINGS) {
    const set = distinctByCategory.get(listing.categorySlug) ?? [];
    if (!set.includes(listing.imageUrl)) set.push(listing.imageUrl);
    distinctByCategory.set(listing.categorySlug, set);
  }
  const distinctAll = [...new Set(DEMO_LISTINGS.map((l) => l.imageUrl))];

  const imageValues = DEMO_LISTINGS.flatMap((listing, index) => {
    const sameCategory = (distinctByCategory.get(listing.categorySlug) ?? [])
      .filter((url) => url !== listing.imageUrl);
    const restOfCatalog = distinctAll.filter(
      (url) => url !== listing.imageUrl && !sameCategory.includes(url),
    );

    // Rotación determinista para que cada anuncio tenga una galería variada.
    const extras = [...sameCategory, ...restOfCatalog];
    const picked = [listing.imageUrl];
    for (let i = 0; picked.length < 4 && i < extras.length; i++) {
      picked.push(extras[(index + i) % extras.length]);
    }

    return [...new Set(picked)].map((url, position) => ({
      listingId: listing.id,
      url,
      position,
    }));
  });

  // Las imágenes no tienen clave natural: se reemplazan para mantener el
  // seed idempotente. `inArray` parametriza los IDs (nada de SQL crudo).
  await db
    .delete(listingImages)
    .where(
      inArray(
        listingImages.listingId,
        DEMO_LISTINGS.map((listing) => listing.id),
      ),
    );
  await db.insert(listingImages).values(imageValues);
}

async function main() {
  const appEnv = getAppEnv();
  const mode = getSeedMode();

  assertDemoAllowed(appEnv, mode);
  requireDatabaseUrl(appEnv);

  const db = getDb();
  console.log(`🎯 APP_ENV=${appEnv} · SEED_ONLY=${mode}`);

  console.log("🔧 Asegurando extensión pg_trgm...");
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

  if (mode === "all" || mode === "categories") {
    await seedCategories(db);
  }

  const categoryRows = await db
    .select()
    .from(categories)
    .orderBy(categories.id);

  const categoryIdBySlug = new Map(
    categoryRows.map((row) => [row.slug, row.id]),
  );

  if (mode === "all" || mode === "demo") {
    await seedDemo(db, categoryIdBySlug);
  }

  const [{ count: listingCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listings)
    .where(eq(listings.status, "active"));

  console.log(
    `✅ Seed completado (${mode}): ${categoryRows.length} categorías y ${listingCount} anuncios activos.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  });
