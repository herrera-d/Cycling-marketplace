import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

/**
 * Rutas que requieren sesión activa.
 * `/sell` (Publicar), `/mis-articulos` (Gestión propia) y `/favoritos`.
 */
const PROTECTED_PREFIXES = ["/sell", "/mis-articulos", "/favoritos"];

/**
 * Proxy — antes llamado `middleware` (Next.js 16 lo renombró a `proxy.ts`).
 *
 * Hace una comprobación **optimista** de la sesión (lee el JWT de la cookie,
 * sin tocar la base de datos). La verificación "segura" vive en el DAL
 * (`lib/dal.ts`) y en cada Server Action / Route Handler.
 */
export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !request.auth?.user) {
    const loginUrl = new URL("/login", request.nextUrl);
    // Conserva el destino para volver tras iniciar sesión.
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Excluye API routes, assets de Next y ficheros estáticos comunes.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
