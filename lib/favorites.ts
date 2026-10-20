import { and, desc, eq, ne } from "drizzle-orm";

import { getDb } from "@/db";
import { categories, favorites, listingImages, listings } from "@/db/schema";
import type { ListingCardData } from "@/lib/listings-types";

/**
 * Favoritos (PLAN §5.6).
 *
 * Lo comparten el CTA del detalle, los corazones de las tarjetas del feed y la
 * página `/favoritos`, para que el estado salga siempre de la misma fuente.
 */

/** ¿El usuario tiene este anuncio en favoritos? */
export async function isListingFavorite(
  userId: string,
  listingId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ listingId: favorites.listingId })
    .from(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)),
    )
    .limit(1);

  return rows.length > 0;
}

/**
 * Devuelve un Set con los IDs de anuncios favoritos del usuario.
 * Útil para marcar corazones en listas (feed).
 */
export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  const db = getDb();
  const rows = await db
    .select({ listingId: favorites.listingId })
    .from(favorites)
    .where(eq(favorites.userId, userId));

  return new Set(rows.map((r) => r.listingId));
}

/**
 * Lista los anuncios favoritos del usuario (activos únicamente).
 * Devuelve datos en formato de tarjeta (ListingCardData).
 */
export async function getUserFavorites(
  userId: string,
): Promise<ListingCardData[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: listings.id,
      title: listings.title,
      priceCents: listings.priceCents,
      currency: listings.currency,
      condition: listings.condition,
      location: listings.location,
      createdAt: listings.createdAt,
      status: listings.status,
      categorySlug: categories.slug,
      categoryName: categories.name,
      imageUrl: listingImages.url,
    })
    .from(favorites)
    .innerJoin(listings, eq(favorites.listingId, listings.id))
    .leftJoin(categories, eq(listings.categoryId, categories.id))
    .leftJoin(
      listingImages,
      and(
        eq(listingImages.listingId, listings.id),
        eq(listingImages.position, 0),
      ),
    )
    .where(and(eq(favorites.userId, userId), eq(listings.status, "active")))
    .orderBy(desc(favorites.createdAt), desc(listings.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    priceCents: row.priceCents,
    currency: row.currency,
    condition: row.condition,
    location: row.location,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    status: row.status,
    categorySlug: row.categorySlug ?? "",
    categoryName: row.categoryName ?? "",
    imageUrl: row.imageUrl,
    brand: null,
    size: null,
  }));
}

/**
 * ¿Existe el anuncio y es visible públicamente?
 *
 * Evita crear favoritos de ids inexistentes o de borradores ajenos.
 */
export async function isPublicListing(listingId: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: listings.id })
    .from(listings)
    .where(and(eq(listings.id, listingId), ne(listings.status, "draft")))
    .limit(1);

  return rows.length > 0;
}

/** Añade a favoritos (idempotente). */
export async function addFavorite(
  userId: string,
  listingId: string,
): Promise<void> {
  const db = getDb();
  await db
    .insert(favorites)
    .values({ userId, listingId })
    .onConflictDoNothing({
      target: [favorites.userId, favorites.listingId],
    });
}

/** Quita de favoritos (idempotente). */
export async function removeFavorite(
  userId: string,
  listingId: string,
): Promise<void> {
  const db = getDb();
  await db
    .delete(favorites)
    .where(
      and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)),
    );
}