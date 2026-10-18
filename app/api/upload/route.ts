import { NextResponse } from "next/server";

import { getOptionalUser } from "@/lib/dal";
import { isSameOrigin } from "@/lib/http";
import { validateImageFile } from "@/lib/image-constraints";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { isStorageConfigured, uploadListingImage } from "@/lib/storage";

/**
 * POST /api/upload — sube una imagen de anuncio (Fase 5, PLAN §5.5).
 *
 * `multipart/form-data` con un único campo `file`. Requiere sesión y responde
 * `{ url }` con la URL pública de Supabase Storage.
 *
 * El tipo y el tamaño se validan aquí (única validación de confianza): lo que
 * haga el cliente es solo feedback anticipado.
 */

/** Límite de subidas por usuario (ventana de 10 minutos). */
const UPLOAD_LIMIT = 60;
const UPLOAD_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const user = await getOptionalUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const limited = rateLimit(`upload:${user.id}`, {
    limit: UPLOAD_LIMIT,
    windowMs: UPLOAD_WINDOW_MS,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Subiste demasiadas imágenes. Probá en unos minutos." },
      { status: 429, headers: rateLimitHeaders(limited) },
    );
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "El almacenamiento de imágenes no está configurado." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la petición inválido" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Falta el archivo (campo `file`)" },
      { status: 400 },
    );
  }

  const invalidReason = validateImageFile(file);
  if (invalidReason) {
    return NextResponse.json({ error: invalidReason }, { status: 400 });
  }

  try {
    const url = await uploadListingImage(file, user.id);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("POST /api/upload failed", error);
    return NextResponse.json(
      { error: "No se pudo subir la imagen" },
      { status: 500 },
    );
  }
}
