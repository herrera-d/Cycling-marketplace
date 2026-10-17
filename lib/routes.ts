/**
 * Rutas que requieren sesión activa.
 *
 * Fuente única de verdad: la consume `proxy.ts` (comprobación optimista) y,
 * si hace falta, la UI. Mantener la lista aquí evita que se desincronice.
 */
export const PROTECTED_PREFIXES = [
  "/sell",
  "/mis-articulos",
  "/favoritos",
] as const;

/**
 * ¿La ruta (`pathname`) requiere sesión?
 *
 * Cubre la ruta exacta y sus subrutas (`/sell/123`), sin confundir prefijos
 * parciales (`/seller` no coincidiría con `/sell`).
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
