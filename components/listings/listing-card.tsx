import Image from "next/image";
import Link from "next/link";
import { ImageOff, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { conditionLabel, formatPrice } from "@/lib/format";
import type { ListingCardData } from "@/lib/listings-types";
import { FavoriteButtonCard } from "@/components/listings/favorite-button-card";
import { LinkPendingIndicator } from "@/components/listings/link-pending-indicator";

/**
 * Tarjeta de anuncio del feed (PLAN §6.2).
 *
 * Anatomía (referencia de diseño): imagen a sangre arriba con degradado
 * inferior, precio como elemento protagonista, título debajo y metadatos
 * discretos al pie. El hover eleva la tarjeta, afina el borde y hace zoom
 * muy leve a la imagen.
 *
 * Rendimiento móvil (3G):
 * - `active:scale-[0.98]` da respuesta táctil inmediata (sin esperar a la
 *   navegación) y `touch-manipulation` elimina el retardo de 300 ms.
 * - El highlight nativo se desactiva: el estado visual lo controla la card.
 * - El `hover` de Tailwind v4 ya está envuelto en `@media (hover: hover)`, así
 *   que en táctil no se dispara.
 * - `imagePriority` marca sólo las primeras tarjetas como `eager`/`high`
 *   (candidatas a LCP); el resto se carga con `loading="lazy"`.
 */
export function ListingCard({
  listing,
  isFavorite = false,
  isAuthenticated = false,
  imagePriority = false,
}: {
  listing: ListingCardData;
  isFavorite?: boolean;
  isAuthenticated?: boolean;
  /** Precarga la portada (primeras tarjetas del feed). */
  imagePriority?: boolean;
}) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-out touch-manipulation [-webkit-tap-highlight-color:transparent] active:scale-[0.98] active:opacity-95 hover:border-foreground/20 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:hover:-translate-y-1"
    >
      {/* `aspect-[4/3]` (barra): la forma `4:3` produce CSS inválido
          (`aspect-ratio: 4:3`) y el bloque de la imagen colapsaba a 0. */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            /* `width`/`height` explícitos (no `fill`): el contenedor pone el
               aspecto y además Chrome no marca el issue de "dimensiones". */
            width={640}
            height={480}
            /* Coincide con el grid real: 2 columnas en móvil, 3 en tablet y 4
               desde `lg`. Antes pedía ~30vw en desktop de 4 columnas, lo que
               descargaba variantes más grandes de las necesarias. */
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            /* En Next 16 `priority` está deprecado: las candidatas a LCP se
               marcan con `loading="eager"` + `fetchPriority="high"`. */
            loading={imagePriority ? "eager" : "lazy"}
            fetchPriority={imagePriority ? "high" : undefined}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/40 text-muted-foreground">
            <ImageOff className="size-8" aria-hidden="true" />
          </div>
        )}

        {/* Degradado inferior: da profundidad a la foto y separa la imagen
            del bloque de texto sin añadir un borde duro. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />

        <Badge
          variant="secondary"
          className="absolute left-3 top-3 border border-white/15 bg-background/90 text-foreground shadow-sm"
        >
          {conditionLabel(listing.condition)}
        </Badge>

        <div className="absolute right-3 top-3">
          <FavoriteButtonCard
            listingId={listing.id}
            initialFavorite={isFavorite}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-heading text-xl font-bold tracking-tight text-foreground">
          {formatPrice(listing.priceCents, listing.currency)}
        </p>

        <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-foreground/90">
          {listing.title}
        </h3>

        {listing.location ? (
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {listing.location}
          </p>
        ) : null}

        {listing.categoryName ? (
          <p className="mt-auto pt-2.5 text-xs text-muted-foreground/80">
            {listing.categoryName}
          </p>
        ) : null}
      </div>

      {/* Señal inmediata de "toque registrado" mientras navega a la ficha. */}
      <LinkPendingIndicator />
    </Link>
  );
}
