import { NextResponse } from "next/server";

import { getOptionalUser } from "@/lib/dal";
import { addFavorite, isPublicListing, removeFavorite } from "@/lib/favorites";
import { listingIdSchema } from "@/lib/validations";

type Context = RouteContext<"/api/favorites/[listingId]">;

/**
 * Defensa en profundidad contra CSRF.
 *
 * La protección primaria es la cookie de sesión de Auth.js (`HttpOnly` +
 * `SameSite=Lax`), que no viaja en peticiones cross-site. Aun así, si el
 * navegador envía `Origin`, exigimos que coincida con el `Host` de la petición.
 * Si no hay `Origin` (clientes no-navegador) no bloqueamos: la sesión sigue
 * siendo obligatoria.
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

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
