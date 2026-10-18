import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_EXTENSION,
  LISTING_IMAGES_BUCKET,
  MAX_IMAGE_BYTES,
} from "@/lib/image-constraints";

/**
 * Capa de almacenamiento de imágenes de anuncios (PLAN §5.5).
 *
 * Usa **Supabase Storage** con la `service_role` key: las subidas ocurren solo
 * desde el servidor (nunca exponemos la clave al navegador) y el bucket es
 * público de lectura para que `next/image` pueda servirlas.
 *
 * El bucket se crea de forma idempotente en la primera subida, así que no hace
 * falta configurarlo a mano en el panel de Supabase.
 */

let cachedClient: SupabaseClient | null = null;

/** `true` si las credenciales de Supabase están presentes. */
export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getStorageClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase Storage no está configurado: faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cachedClient ??= createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}

/** Crea el bucket público si no existe. Idempotente. */
export async function ensureListingImagesBucket(): Promise<void> {
  const supabase = getStorageClient();

  const { error } = await supabase.storage.createBucket(
    LISTING_IMAGES_BUCKET,
    {
      public: true,
      fileSizeLimit: MAX_IMAGE_BYTES,
      allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
    },
  );

  // `createBucket` falla si ya existe: eso no es un problema.
  if (error && !/already exists/i.test(error.message)) {
    throw error;
  }
}

/**
 * Sube una imagen y devuelve su URL pública.
 *
 * El nombre del archivo lo genera el servidor (uuid) y la extensión se deriva
 * del MIME verificado, no del nombre original: así evitamos rutas maliciosas
 * (`../`) y extensiones falsas.
 */
export async function uploadListingImage(
  file: File,
  userId: string,
): Promise<string> {
  await ensureListingImagesBucket();

  const supabase = getStorageClient();
  const extension =
    IMAGE_EXTENSION[file.type as keyof typeof IMAGE_EXTENSION] ?? "bin";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "31536000",
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Comprueba que una URL corresponde a una imagen de nuestro bucket.
 *
 * El cliente solo envía URLs (ya subidas), así que antes de guardarlas en la
 * base de datos verificamos que sean nuestras: evita que se inyecten imágenes
 * externas arbitrarias en un anuncio.
 */
export function isOwnedListingImageUrl(url: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;

  try {
    const parsed = new URL(url);
    const expected = new URL(base);
    return (
      parsed.origin === expected.origin &&
      parsed.pathname.startsWith(
        `/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/`,
      )
    );
  } catch {
    return false;
  }
}
