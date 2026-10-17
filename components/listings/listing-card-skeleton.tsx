import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto de tarjeta (shimmer) para la carga inicial y el scroll. */
export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-3 h-3 w-1/2" />
      </div>
    </div>
  );
}

/** Rejilla de esqueletos (fallback de Suspense y páginas siguientes). */
export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}
