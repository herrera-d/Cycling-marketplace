import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isProtectedPath } from "@/lib/routes";

/**
 * Proxy — antes llamado `middleware` (Next.js 16 lo renombró a `proxy.ts`).
 *
 * Hace una comprobación **optimista** de la sesión (lee el JWT de la cookie,
 * sin tocar la base de datos). La verificación "segura" vive en el DAL
 * (`lib/dal.ts`) y en cada Server Action / Route Handler.
 *
 * Nota de seguridad: el Proxy no es una frontera de seguridad. Toda Server
 * Action / Route Handler que lea o mute datos debe re-verificar la sesión.
 */
export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;

  if (isProtectedPath(pathname) && !request.auth?.user) {
    const loginUrl = new URL("/login", request.nextUrl);
    // Conserva el destino para volver tras iniciar sesión.
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Excluye API routes (`/api/…`), assets de Next y ficheros estáticos comunes.
  // Nota: `api/` (con barra) para no excluir por error rutas como `/apicultura`.
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
