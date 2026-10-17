import { and, eq, ne } from "drizzle-orm";

import { getDb } from "@/db";
import { favorites, listings } from "@/db/schema";

/**
 * Favoritos (PLAN §5.6).
 *
 * En la Fase 4 solo se usa para el CTA del detalle; los corazones del feed y la
 * página `/favoritos` llegan en la Fase 6 reutilizando estas funciones.
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
