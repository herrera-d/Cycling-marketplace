import { NextResponse } from "next/server";

import { getOptionalUser } from "@/lib/dal";
import { addFavorite, isPublicListing, removeFavorite } from "@/lib/favorites";
import { listingIdSchema } from "@/lib/validations";

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
  context: RouteContext<"/api/favorites/[listingId]">,
  action: "add" | "remove",
) {
  const { listingId } = await context.params;

  const parsed = listingIdSchema.safeParse(listingId);
  if (!parsed.success) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  const user = await getOptionalUser();
  if (!user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
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

export async function POST(
  _request: Request,
  context: RouteContext<"/api/favorites/[listingId]">,
) {
  return toggle(context, "add");
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/favorites/[listingId]">,
) {
  return toggle(context, "remove");
}
