"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

/**
 * CTA de favorito del detalle (PLAN §5.4 / §5.6).
 *
 * - Sin sesión: lleva a `/login` conservando la ruta de vuelta.
 * - Con sesión: alterna el favorito contra `/api/favorites/:id` de forma
 *   optimista, revirtiendo si la petición falla.
 *
 * La reutilizan las tarjetas del feed y la página `/favoritos`.
 */
export function FavoriteButton({
  listingId,
  initialFavorite,
  isAuthenticated,
  className,
}: {
  listingId: string;
  initialFavorite: boolean;
  isAuthenticated: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const next = !favorite;
    setFavorite(next); // optimista
    setError(false);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/favorites/${listingId}`, {
          method: next ? "POST" : "DELETE",
        });

        if (!response.ok) throw new Error(String(response.status));

        const data = (await response.json()) as { favorite: boolean };
        setFavorite(data.favorite);

        // En `/favoritos` la grilla viene del servidor: sin este refresh el
        // anuncio quedaría visible (con el corazón vacío) hasta recargar.
        if (pathname === "/favoritos") router.refresh();
      } catch {
        setFavorite(!next); // revertir
        setError(true);
      }
    });
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleClick}
        aria-pressed={isAuthenticated ? favorite : undefined}
        aria-label={
          favorite ? "Quitar de favoritos" : "Guardar en favoritos"
        }
        className="w-full rounded-full sm:w-auto"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Heart
            className={cn("size-4", favorite && "fill-primary text-primary")}
            aria-hidden="true"
          />
        )}
        {favorite ? "Guardado" : "Guardar"}
      </Button>

      <p role="status" aria-live="polite" className="sr-only">
        {error
          ? "No se pudo actualizar el favorito."
          : favorite
            ? "Añadido a favoritos."
            : ""}
      </p>
      {error ? (
        <p className="mt-2 text-xs text-destructive">
          No se pudo guardar. Inténtalo de nuevo.
        </p>
      ) : null}
    </div>
  );
}
