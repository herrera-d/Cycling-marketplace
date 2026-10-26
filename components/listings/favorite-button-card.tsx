"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Botón de favorito para tarjetas del feed.
 * Evita la navegación al detalle al hacer click (stopPropagation + preventDefault).
 */
export function FavoriteButtonCard({
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
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const next = !favorite;
    setFavorite(next);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/favorites/${listingId}`, {
          method: next ? "POST" : "DELETE",
        });

        if (!response.ok) throw new Error(String(response.status));

        const data = (await response.json()) as { favorite: boolean };
        setFavorite(data.favorite);
      } catch {
        setFavorite(!next);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-pressed={isAuthenticated ? favorite : undefined}
      aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={cn(
        "relative z-10 size-9 rounded-full bg-background/90 shadow-sm hover:bg-background",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Heart
          className={cn("size-4", favorite && "fill-primary text-primary")}
          aria-hidden="true"
        />
      )}
    </Button>
  );
}