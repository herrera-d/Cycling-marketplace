import { connection } from "next/server";
import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

/**
 * Lee la sesión en **tiempo de petición**.
 *
 * `connection()` detiene el prerender aquí, de modo que la sesión (y el
 * `crypto.getRandomValues()` que Auth.js usa al descifrar/emitir el JWT) nunca
 * se evalúa durante el prerender del shell estático. Sin esto, con
 * `cacheComponents` activado, Next.js lo reporta como "unstable value".
 */
export async function getSession() {
  await connection();
  return auth();
}

/**
 * Data Access Layer (DAL): única puerta para exigir sesión en el servidor.
 *
 * `cache()` deduplica la lectura durante un mismo render. Si no hay sesión,
 * redirige a `/login`; nunca devuelve un usuario "a medias".
 */
export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return {
    isAuth: true as const,
    userId: session.user.id,
    user: session.user,
  };
});

/** Igual que `verifySession` pero sin redirigir: `null` si no hay sesión. */
export const getOptionalUser = cache(async () => {
  const session = await getSession();
  return session?.user?.id ? session.user : null;
});
