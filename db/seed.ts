import { config } from "dotenv";
import { eq, inArray, sql } from "drizzle-orm";

// Permite ejecutar `npm run db:seed` con .env.local (Next) o .env.
config({ path: [".env.local", ".env"] });

import { getDb } from "./index";
import { DEMO_LISTINGS, DEMO_SELLER_ID } from "./demo-listings";
import {
  categories,
  listingImages,
  listings,
  users,
  type NewCategory,
} from "./schema";

/**
 * Categorías del marketplace (coinciden con las del PLAN.md sección 4).
 * El campo `icon` guarda el nombre de un icono de lucide-react (kebab-case).
 */
const CATEGORIES: NewCategory[] = [
  { name: "Bicicletas", slug: "bicicletas", icon: "bike" },
  { name: "Componentes", slug: "componentes", icon: "cog" },
  { name: "Ruedas", slug: "ruedas", icon: "circle-dot" },
  { name: "Ropa", slug: "ropa", icon: "shirt" },
  { name: "Calzado", slug: "calzado", icon: "footprints" },
  { name: "Cascos", slug: "cascos", icon: "hard-hat" },
  { name: "Accesorios", slug: "accesorios", icon: "backpack" },
  { name: "Entrenamiento", slug: "entrenamiento", icon: "activity" },
  { name: "Herramientas", slug: "herramientas", icon: "wrench" },
];

async function main() {
  const db = getDb();

  console.log("🔧 Asegurando extensión pg_trgm...");
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

  console.log(`🌱 Sembrando ${CATEGORIES.length} categorías...`);
  await db
    .insert(categories)
    .values(CATEGORIES)
    .onConflictDoNothing({ target: categories.slug });

  const categoryRows = await db
    .select()
    .from(categories)
    .orderBy(categories.id);

  const categoryIdBySlug = new Map(
    categoryRows.map((row) => [row.slug, row.id]),
  );

  // --- Vendedor de demostración -------------------------------------------
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

  // --- Anuncios de demostración -------------------------------------------
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

  const imageValues = DEMO_LISTINGS.map((listing) => ({
    listingId: listing.id,
    url: listing.imageUrl,
    position: 0,
  }));

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

  const [{ count: listingCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(listings)
    .where(eq(listings.status, "active"));

  console.log(
    `✅ Seed completado: ${categoryRows.length} categorías y ${listingCount} anuncios activos.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  });
