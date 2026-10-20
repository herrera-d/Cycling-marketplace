import { NextResponse } from "next/server";

import { getOptionalUser } from "@/lib/dal";
import { addFavorite, isPublicListing, removeFavorite } from "@/lib/favorites";
import { isSameOrigin } from "@/lib/http";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { listingIdSchema } from "@/lib/validations";

/** Toggles de favoritos por usuario (evita martillar la API desde un script). */
const FAVORITE_LIMIT = 60;
const FAVORITE_WINDOW_MS = 60 * 1000;

type Context = RouteContext<"/api/favorites/[listingId]">;

/**
 * Favoritos de un anuncio (PLAN §5.6).
 *
 * - `POST   /api/favorites/:listingId` → añade (idempotente).
 * - `DELETE /api/favorites/:listingId` → quita (idempotente).
 *
 * Requiere sesión: sin ella responde 401 (el cliente decide redirigir a
 * `/login`). Nunca redirige desde la API para no romper el `fetch`.
 */
async function toggle(
  request: Request,
  context: Context,
  action: "add" | "remove",
) {
  const { listingId } = await context.params;

  const parsed = listingIdSchema.safeParse(listingId);
  if (!parsed.success) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Origen no permitido" },
      { status: 403 },
    );
  }

  const user = await getOptionalUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const limited = await rateLimit(`favorites:${user.id}`, {
    limit: FAVORITE_LIMIT,
    windowMs: FAVORITE_WINDOW_MS,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiadas operaciones seguidas. Probá en un minuto." },
      { status: 429, headers: rateLimitHeaders(limited) },
    );
  }

  // Solo se puede marcar un anuncio que exista y sea público.
  if (!(await isPublicListing(parsed.data))) {
    return NextResponse.json(
      { error: "Anuncio no encontrado" },
      { status: 404 },
    );
  }

  try {
    if (action === "add") {
      await addFavorite(user.id, parsed.data);
    } else {
      await removeFavorite(user.id, parsed.data);
    }

    return NextResponse.json({ favorite: action === "add" });
  } catch (error) {
    console.error(`/api/favorites/${parsed.data} (${action}) failed`, error);
    return NextResponse.json(
      { error: "No se pudo actualizar el favorito" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: Context) {
  return toggle(request, context, "add");
}

export async function DELETE(request: Request, context: Context) {
  return toggle(request, context, "remove");
}
