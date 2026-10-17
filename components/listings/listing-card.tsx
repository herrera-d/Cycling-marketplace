import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { conditionLabel, formatPrice } from "@/lib/format";
import type { ListingCardData } from "@/lib/listings-types";

/**
 * Tarjeta de anuncio del feed (PLAN §6.2): imagen 4:3, precio destacado,
 * badge de condición, hover con elevación + zoom y foco visible.
 */
export function ListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/40 text-muted-foreground">
            <ImageOff className="size-8" aria-hidden="true" />
          </div>
        )}

        <Badge
          variant="secondary"
          className="absolute left-3 top-3 shadow-sm backdrop-blur-sm"
        >
          {conditionLabel(listing.condition)}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-lg font-semibold tracking-tight">
          {formatPrice(listing.priceCents, listing.currency)}
        </p>

        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {listing.title}
        </h3>

        <p className="mt-auto truncate pt-2 text-xs text-muted-foreground">
          {[listing.location, listing.categoryName].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
