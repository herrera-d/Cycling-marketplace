import { config } from "dotenv";
import { sql } from "drizzle-orm";

// Permite ejecutar `npm run db:seed` con .env.local (Next) o .env.
config({ path: [".env.local", ".env"] });

import { getDb } from "./index";
import { categories, type NewCategory } from "./schema";

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

  const rows = await db
    .select()
    .from(categories)
    .orderBy(categories.id);

  console.table(
    rows.map(({ id, name, slug, icon }) => ({ id, name, slug, icon })),
  );
  console.log(`✅ Seed completado: ${rows.length} categorías en la base de datos.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  });
