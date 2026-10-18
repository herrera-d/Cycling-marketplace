import { z } from "zod";

import { MAX_LISTING_IMAGES } from "@/lib/image-constraints";

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

/* -------------------------------------------------------------------------- */
/* Publicar un anuncio (Fase 5)                                               */
/* -------------------------------------------------------------------------- */

/** Monedas admitidas (espejo de `lib/format.ts`; ver `CURRENCIES`). */
export const CURRENCY_VALUES = ["ARS", "USD", "EUR", "MXN", "BRL"] as const;

/**
 * Precio máximo en unidades mayores.
 *
 * `price_cents` es `int4` (máx. 2 147 483 647), así que el precio en unidades
 * mayores no puede pasar de ~21,47 M. Lo dejamos en 20 M por margen de redondeo.
 */
export const MAX_PRICE_MAJOR = 20_000_000;

/** Texto opcional: campo vacío (`""`) se normaliza a `null` al persistir. */
const optionalFormText = (max: number) =>
  z.string().trim().max(max, `No puede superar los ${max} caracteres.`).optional();

/**
 * Esquema del formulario de publicación.
 *
 * Se usa **en el cliente** (react-hook-form + zodResolver) y **en el servidor**
 * (`POST /api/listings`): una sola fuente de verdad para las reglas.
 *
 * `images` son URLs ya subidas a Supabase Storage; el servidor además verifica
 * que pertenezcan a nuestro bucket.
 */
export const listingFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(8, "El título debe tener al menos 8 caracteres.")
    .max(120, "El título no puede superar los 120 caracteres."),
  description: z
    .string()
    .trim()
    .min(20, "Describí tu artículo con al menos 20 caracteres.")
    .max(4000, "La descripción no puede superar los 4000 caracteres."),
  categorySlug: z.string().trim().min(1, "Elegí una categoría.").max(60),
  condition: z.enum(CONDITION_VALUES),
  brand: optionalFormText(60),
  size: optionalFormText(40),
  price: z
    .number({ error: "Ingresá un precio válido." })
    .positive("El precio debe ser mayor a 0.")
    .max(MAX_PRICE_MAJOR, "El precio es demasiado alto."),
  currency: z.enum(CURRENCY_VALUES),
  location: z
    .string()
    .trim()
    .min(2, "Indicá dónde está el artículo.")
    .max(80, "La ubicación no puede superar los 80 caracteres."),
  images: z
    .array(z.string().url())
    .min(1, "Subí al menos una foto.")
    .max(MAX_LISTING_IMAGES, `Podés subir hasta ${MAX_LISTING_IMAGES} fotos.`),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;
