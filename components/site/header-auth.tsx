import Link from "next/link";

import { UserMenu } from "@/components/site/user-menu";
import { Button } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/dal";

/**
 * Parte del header que depende de la sesión.
 *
 * Con `cacheComponents` activado, leer la sesión no puede formar parte del
 * shell estático, así que este componente se renderiza dentro de un
 * `<Suspense>` (ver `header.tsx`) y la lectura ocurre en tiempo de petición
 * (vía `getOptionalUser` → `connection()`).
 */
export async function HeaderAuth() {
  const user = await getOptionalUser();

  if (!user) {
    return (
      <Button
        nativeButton={false}
        render={<Link href="/login" />}
        variant="ghost"
        className="rounded-full"
      >
        Iniciar sesión
      </Button>
    );
  }

  return (
    <UserMenu
      name={user.name ?? null}
      email={user.email ?? null}
      image={user.image ?? null}
    />
  );
}
