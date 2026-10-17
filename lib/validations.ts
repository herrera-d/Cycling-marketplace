import { z } from "zod";

/**
 * Validación de los parámetros de `GET /api/listings`.
 *
 * Los nombres coinciden con el contrato del PLAN §5.2:
 * `cursor, categoria, min, max, condicion, ubi, orden, q`.
 */

/** Convierte `""` (parámetro presente pero vacío) en `undefined`. */
const blankToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const optionalText = (max: number) =>
  z.preprocess(
    blankToUndefined,
    z.string().trim().min(1).max(max).optional(),
  );

const optionalPrice = z.preprocess(
  blankToUndefined,
  z.coerce.number().int().min(0).max(100_000_000).optional(),
);

export const SORT_VALUES = ["recentes", "precio_asc", "precio_desc"] as const;
export const CONDITION_VALUES = ["new", "like_new", "good", "fair"] as const;

export const listingQuerySchema = z.object({
  /** Slug de categoría (filtro único). */
  categoria: optionalText(60),
  /** Texto de búsqueda (título o descripción). */
  q: optionalText(120),
  /** Precio mínimo en unidades mayores (ej. 100 → 10000 centavos). */
  min: optionalPrice,
  /** Precio máximo en unidades mayores. */
  max: optionalPrice,
  /** Condición del artículo. */
  condicion: z.preprocess(
    blankToUndefined,
    z.enum(CONDITION_VALUES).optional(),
  ),
  /** Ubicación (texto libre). */
  ubi: optionalText(80),
  /** Orden del feed. */
  orden: z.preprocess(
    blankToUndefined,
    z.enum(SORT_VALUES).default("recentes"),
  ),
  /** Cursor opaco de paginación (keyset). */
  cursor: z.preprocess(blankToUndefined, z.string().max(300).optional()),
  /** Tamaño de página. */
  limit: z.preprocess(
    blankToUndefined,
    z.coerce.number().int().min(1).max(48).default(12),
  ),
});

export type ListingQuery = z.infer<typeof listingQuerySchema>;

/** Cursor de paginación decodificado. */
export const cursorSchema = z.object({
  s: z.enum(SORT_VALUES),
  v: z.union([z.string(), z.number()]),
  id: z.string().uuid(),
});

export type DecodedCursor = z.infer<typeof cursorSchema>;

/**
 * Normaliza los parámetros de la URL al objeto de consulta del feed.
 *
 * Ignora el `cursor` (lo gestiona TanStack Query) para poder usarse como
 * query key estable en el cliente.
 */
export function parseListingQuery(
  input: Record<string, string | null | undefined>,
): ListingQuery {
  const parsed = listingQuerySchema.safeParse(input);
  const data = parsed.success ? parsed.data : listingQuerySchema.parse({});
  return { ...data, cursor: undefined };
}

/**
 * Valida el `id` de un anuncio antes de tocar la base de datos.
 *
 * Postgres lanza un error si se le pasa un uuid malformado, así que un id
 * inválido debe resolverse como "no encontrado" (404), no como error 500.
 */
export const listingIdSchema = z.string().uuid();
