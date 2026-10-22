import Image from "next/image";
import Link from "next/link";
import { ImageOff, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { conditionLabel, formatPrice } from "@/lib/format";
import type { ListingCardData } from "@/lib/listings-types";
import { FavoriteButtonCard } from "@/components/listings/favorite-button-card";

/**
 * Tarjeta de anuncio del feed (PLAN §6.2).
 *
 * Anatomía (referencia de diseño): imagen a sangre arriba con degradado
 * inferior, precio como elemento protagonista, título debajo y metadatos
 * discretos al pie. El hover eleva la tarjeta, afina el borde y hace zoom
 * muy leve a la imagen.
 */
export function ListingCard({
  listing,
  isFavorite = false,
  isAuthenticated = false,
}: {
  listing: ListingCardData;
  isFavorite?: boolean;
  isAuthenticated?: boolean;
}) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
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
          className="absolute left-3 top-3 border border-white/15 bg-background/85 text-foreground shadow-sm backdrop-blur-md"
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
    </Link>
  );
}
