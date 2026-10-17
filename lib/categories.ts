import { asc } from "drizzle-orm";

import { getDb } from "@/db";
import { categories } from "@/db/schema";
import type { CategoryOption } from "@/lib/listings-types";

/** Categorías para los filtros y chips del feed (orden estable). */
export async function getCategories(): Promise<CategoryOption[]> {
  const db = getDb();
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon: categories.icon,
    })
    .from(categories)
    .orderBy(asc(categories.id));
}
