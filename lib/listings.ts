import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  ne,
  or,
  type SQL,
} from "drizzle-orm";

import { getDb } from "@/db";
import {
  categories,
  listingImages,
  listings,
  users,
} from "@/db/schema";
import type { ListingDetail, ListingsPage } from "@/lib/listings-types";
import {
  cursorSchema,
  type DecodedCursor,
  type ListingQuery,
} from "@/lib/validations";

/** Límite de `integer` de Postgres (`price_cents` es int4). */
const MAX_PRICE_CENTS = 2_147_483_647;

/** Escapa los comodines de `LIKE`/`ILIKE` para que la búsqueda sea literal. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

/** Evita el desbordamiento de `int4` al pasar de unidades mayores a centavos. */
function clampPriceCents(value: number): number {
  return Math.min(Math.max(value, 0), MAX_PRICE_CENTS);
}

/**
 * Codifica/decodifica el cursor de paginación (keyset).
 *
 * Un cursor opaco evita exponer detalles internos y, a diferencia de
 * `OFFSET`, no se rompe si entran anuncios nuevos mientras se hace scroll.
 */
function encodeCursor(cursor: DecodedCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeCursor(raw: string | undefined): DecodedCursor | null {
  if (!raw) return null;
  try {
    const parsed = cursorSchema.safeParse(
      JSON.parse(Buffer.from(raw, "base64url").toString("utf8")),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Condición SQL que continúa la paginación según el orden activo. */
function cursorCondition(cursor: DecodedCursor): SQL | undefined {
  if (cursor.s === "precio_asc" || cursor.s === "precio_desc") {
    const value = Number(cursor.v);
    // Cursor manipulado: se ignora en vez de romper la consulta con un 500.
    if (!Number.isInteger(value) || value < 0 || value > MAX_PRICE_CENTS) {
      return undefined;
    }
    return cursor.s === "precio_asc"
      ? or(
          gt(listings.priceCents, value),
          and(eq(listings.priceCents, value), gt(listings.id, cursor.id)),
        )
      : or(
          lt(listings.priceCents, value),
          and(eq(listings.priceCents, value), lt(listings.id, cursor.id)),
        );
  }

  const value = new Date(String(cursor.v));
  if (Number.isNaN(value.getTime())) return undefined;
  // `timestamptz` solo admite años 0001–9999: fuera de ese rango Postgres
  // responde "time zone displacement out of range" (500). Se ignora el cursor.
  const year = value.getUTCFullYear();
  if (year < 1 || year > 9999) return undefined;
  return or(
    lt(listings.createdAt, value),
    and(eq(listings.createdAt, value), lt(listings.id, cursor.id)),
  );
}

function orderBy(query: ListingQuery) {
  if (query.orden === "precio_asc") {
    return [asc(listings.priceCents), asc(listings.id)];
  }
  if (query.orden === "precio_desc") {
    return [desc(listings.priceCents), desc(listings.id)];
  }
  return [desc(listings.createdAt), desc(listings.id)];
}

/** Filtros del feed (sin cursor): se reutilizan para el total. */
function baseFilters(query: ListingQuery): SQL[] {
  const filters: SQL[] = [eq(listings.status, "active")];

  if (query.categoria) {
    filters.push(eq(categories.slug, query.categoria));
  }
  if (query.q) {
    const term = `%${escapeLike(query.q)}%`;
    const search = or(
      ilike(listings.title, term),
      ilike(listings.description, term),
    );
    if (search) filters.push(search);
  }
  if (query.min !== undefined) {
    filters.push(gte(listings.priceCents, clampPriceCents(query.min * 100)));
  }
  if (query.max !== undefined) {
    filters.push(lte(listings.priceCents, clampPriceCents(query.max * 100)));
  }
  if (query.condicion) {
    filters.push(eq(listings.condition, query.condicion));
  }
  if (query.ubi) {
    filters.push(ilike(listings.location, `%${escapeLike(query.ubi)}%`));
  }

  return filters;
}

/**
 * Página del feed con paginación por cursor.
 *
 * Nota: el rango de precio (`min`/`max`) se aplica sobre `price_cents` sin
 * convertir moneda. Con varias monedas activas el filtro es una aproximación;
 * ver "deuda" en `docs/progress.md` (normalización de moneda, Fase 8).
 */
export async function getListingsPage(
  query: ListingQuery,
): Promise<ListingsPage> {
  const db = getDb();
  const filters = baseFilters(query);

  const cursor = decodeCursor(query.cursor);
  const continuation =
    cursor && cursor.s === query.orden ? cursorCondition(cursor) : undefined;
  const where = continuation ? and(...filters, continuation) : and(...filters);

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: listings.id,
        title: listings.title,
        priceCents: listings.priceCents,
        currency: listings.currency,
        condition: listings.condition,
        location: listings.location,
        brand: listings.brand,
        categorySlug: categories.slug,
        categoryName: categories.name,
        createdAt: listings.createdAt,
      })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(where)
      .orderBy(...orderBy(query))
      .limit(query.limit + 1),
    db
      .select({ value: count() })
      .from(listings)
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(and(...filters)),
  ]);

  const hasMore = rows.length > query.limit;
  const pageRows = hasMore ? rows.slice(0, query.limit) : rows;

  const imageByListing = new Map<string, string>();
  if (pageRows.length > 0) {
    const images = await db
      .select({
        listingId: listingImages.listingId,
        url: listingImages.url,
        position: listingImages.position,
      })
      .from(listingImages)
      .where(
        inArray(
          listingImages.listingId,
          pageRows.map((row) => row.id),
        ),
      )
      .orderBy(asc(listingImages.position));

    for (const image of images) {
      if (!imageByListing.has(image.listingId)) {
        imageByListing.set(image.listingId, image.url);
      }
    }
  }

  const last = pageRows.at(-1);
  const nextCursor =
    hasMore && last
      ? encodeCursor({
          s: query.orden,
          v:
            query.orden === "recentes"
              ? last.createdAt.toISOString()
              : last.priceCents,
          id: last.id,
        })
      : null;

  return {
    items: pageRows.map((row) => ({
      id: row.id,
      title: row.title,
      priceCents: row.priceCents,
      currency: row.currency,
      condition: row.condition,
      location: row.location,
      brand: row.brand,
      categorySlug: row.categorySlug,
      categoryName: row.categoryName,
      imageUrl: imageByListing.get(row.id) ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
    nextCursor,
    total: totalRows[0]?.value ?? 0,
  };
}

/**
 * Devuelve un anuncio completo para la página de detalle (PLAN §5.4).
 *
 * Solo se exponen anuncios publicados (`active`/`sold`): los borradores se
 * reservan para su dueño en la Fase 7. Devuelve `null` si no existe o no es
 * público, para que la página pueda responder 404.
 */
export async function getListingById(
  id: string,
): Promise<ListingDetail | null> {
  const db = getDb();

  const rows = await db
    .select({
      id: listings.id,
      title: listings.title,
      description: listings.description,
      priceCents: listings.priceCents,
      currency: listings.currency,
      condition: listings.condition,
      brand: listings.brand,
      size: listings.size,
      location: listings.location,
      status: listings.status,
      createdAt: listings.createdAt,
      categorySlug: categories.slug,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      sellerId: users.id,
      sellerName: users.name,
      sellerImage: users.image,
      sellerSince: users.createdAt,
    })
    .from(listings)
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .innerJoin(users, eq(listings.sellerId, users.id))
    .where(and(eq(listings.id, id), ne(listings.status, "draft")))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const images = await db
    .select({ url: listingImages.url })
    .from(listingImages)
    .where(eq(listingImages.listingId, id))
    .orderBy(asc(listingImages.position));

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priceCents: row.priceCents,
    currency: row.currency,
    condition: row.condition,
    brand: row.brand,
    size: row.size,
    location: row.location,
    status: row.status,
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    categoryIcon: row.categoryIcon,
    images: images.map((image) => image.url),
    seller: {
      id: row.sellerId,
      name: row.sellerName,
      image: row.sellerImage,
      memberSince: row.sellerSince.toISOString(),
    },
    createdAt: row.createdAt.toISOString(),
  };
}
