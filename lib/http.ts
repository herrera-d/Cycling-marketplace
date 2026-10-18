/**
 * Guardas HTTP compartidas por las rutas mutantes (POST/PATCH/DELETE).
 */

/**
 * Defensa en profundidad contra CSRF.
 *
 * La protección primaria es la cookie de sesión de Auth.js (`HttpOnly` +
 * `SameSite=Lax`), que no viaja en peticiones cross-site. Aun así, si el
 * navegador envía `Origin`, exigimos que coincida con el `Host` de la petición.
 * Si no hay `Origin` (clientes no-navegador, como `curl`) no bloqueamos aquí:
 * la sesión sigue siendo obligatoria más adelante.
 */
export function isSameOrigin(request: Request): boolean {
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
