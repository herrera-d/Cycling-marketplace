import { connection } from "next/server";
import { NextResponse } from "next/server";

import { getOptionalUser } from "@/lib/dal";
import { isSameOrigin } from "@/lib/http";
import { createListing, getListingsPage } from "@/lib/listings";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { isOwnedListingImageUrl } from "@/lib/storage";
import { listingFormSchema, listingQuerySchema } from "@/lib/validations";

/**
 * GET /api/listings — feed público paginado por cursor.
 *
 * Contrato (PLAN §5.2): `{ items, nextCursor, total }`.
 * Params: `cursor, categoria, q, min, max, condicion, ubi, orden, limit`.
 */
export async function GET(request: Request) {
  // La ruta es dinámica (datos en vivo): sin esto Next la prerenderizaría.
  await connection();

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = listingQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const page = await getListingsPage(parsed.data);
    return NextResponse.json(page, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("GET /api/listings failed", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los anuncios" },
      { status: 500 },
    );
  }
}

/** Límite de publicaciones por usuario (ventana de 1 hora). */
const CREATE_LIMIT = 10;
const CREATE_WINDOW_MS = 60 * 60 * 1000;

/**
 * POST /api/listings — publica un anuncio (Fase 5).
 *
 * Requiere sesión. Recibe el JSON del formulario (con `images` ya subidas a
 * Supabase Storage) y devuelve `{ id }` para que el cliente navegue al detalle.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const user = await getOptionalUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const limited = await rateLimit(`listing:create:${user.id}`, {
    limit: CREATE_LIMIT,
    windowMs: CREATE_WINDOW_MS,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Publicaste demasiados anuncios. Probá más tarde." },
      { status: 429, headers: rateLimitHeaders(limited) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = listingFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Solo aceptamos imágenes alojadas en nuestro bucket.
  if (!parsed.data.images.every(isOwnedListingImageUrl)) {
    return NextResponse.json(
      { error: "Una o más imágenes no son válidas" },
      { status: 400 },
    );
  }

  try {
    const created = await createListing(parsed.data, user.id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings failed", error);
    return NextResponse.json(
      { error: "No se pudo publicar el anuncio" },
      { status: 500 },
    );
  }
}
