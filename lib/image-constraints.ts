/**
 * Restricciones de las imágenes de anuncio (PLAN §5.5).
 *
 * Vive en su propio módulo **sin dependencias** para poder importarse tanto
 * desde el servidor (`lib/storage.ts`) como desde componentes cliente
 * (`upload-images.tsx`) sin arrastrar `@supabase/supabase-js` al bundle.
 */

/**
 * Bucket de Supabase Storage donde viven las fotos de un anuncio.
 *
 * Cada ambiente aísla sus imágenes en su propio bucket (misma idea que los
 * branches de Neon, PLAN §13.1):
 *
 *   development → `listings` (default)
 *   staging     → `listings-staging`
 *   production  → `listings-prod`
 *
 * Se lee con el prefijo `NEXT_PUBLIC_` porque este módulo se importa tanto
 * desde el servidor (`lib/storage.ts`) como desde el cliente
 * (`upload-images.tsx`), y Next solo inyecta en el bundle las variables
 * públicas. El nombre va **incrustado en el build**, así que cada entorno
 * (Vercel Preview/Production, `next dev` local) apunta a su bucket.
 *
 * Si la variable no está definida cae en `listings` (comportamiento previo).
 */
export const LISTING_IMAGES_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "listings";

/** Máximo de imágenes por anuncio. */
export const MAX_LISTING_IMAGES = 8;

/** Tamaño máximo por imagen (5 MB). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/** Extensión de archivo por tipo MIME (el tipo lo fija el servidor, no el nombre). */
export const IMAGE_EXTENSION: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Texto para mensajes de error/ayuda. */
export const ALLOWED_IMAGE_TYPES_LABEL = "JPG, PNG, WebP o AVIF";

/** Tamaño máximo legible (para mensajes). */
export const MAX_IMAGE_MEGABYTES = Math.round(MAX_IMAGE_BYTES / (1024 * 1024));

export function isAllowedImageType(
  type: string,
): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

/**
 * Valida tipo y tamaño de un archivo. Devuelve el mensaje de error o `null`
 * si es válido. Se usa igual en el cliente (feedback inmediato) y en el
 * servidor (única validación de confianza).
 */
export function validateImageFile(file: {
  type: string;
  size: number;
}): string | null {
  if (!isAllowedImageType(file.type)) {
    return `Formato no permitido. Usá ${ALLOWED_IMAGE_TYPES_LABEL}.`;
  }
  if (file.size <= 0) {
    return "El archivo está vacío.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `La imagen supera los ${MAX_IMAGE_MEGABYTES} MB.`;
  }
  return null;
}
