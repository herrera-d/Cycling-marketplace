"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

import { EmptyState } from "@/components/listings/empty-state";
import { ErrorState } from "@/components/listings/error-state";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingGridSkeleton } from "@/components/listings/listing-card-skeleton";
import { fetchListingsPage } from "@/lib/api-client";
import type { ListingCardData, ListingsPage } from "@/lib/listings-types";
import { useListingFilters } from "@/lib/use-listing-filters";
import type { ListingQuery } from "@/lib/validations";

type InfiniteFeedProps = {
  /** Primera página renderizada en el servidor (SEO + sin parpadeo). */
  initialData: ListingsPage;
  /** Filtros normalizados; forman la query key. */
  query: ListingQuery;
  favorites?: Set<string>;
  isAuthenticated?: boolean;
};

export function InfiniteFeed({
  initialData,
  query,
  favorites = new Set<string>(),
  isAuthenticated = false,
}: InfiniteFeedProps) {
  const { clearAll } = useListingFilters();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    refetch,
    status,
  } = useInfiniteQuery({
    queryKey: ["listings", query],
    queryFn: ({ pageParam, signal }) =>
      fetchListingsPage(query, pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: { pages: [initialData], pageParams: [null] },
  });

  // Aplana las páginas eliminando duplicados (garantía del DoD).
  const items = useMemo(() => {
    const seen = new Set<string>();
    const result: ListingCardData[] = [];
    for (const page of data?.pages ?? []) {
      for (const item of page.items) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          result.push(item);
        }
      }
    }
    return result;
  }, [data]);

  // Sentinel: carga la siguiente página al acercarse al final.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isError && items.length === 0) {
    return (
      <ErrorState
        description={
          error instanceof Error
            ? error.message
            : "No pudimos cargar los anuncios."
        }
        onRetry={() => void refetch()}
      />
    );
  }

  if (status === "success" && items.length === 0) {
    return <EmptyState onClear={clearAll} />;
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {items.map((item) => (
          <ListingCard
            key={item.id}
            listing={item}
            isFavorite={favorites.has(item.id)}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>

      {isFetchingNextPage ? (
        <div className="mt-6">
          <ListingGridSkeleton count={4} />
        </div>
      ) : null}

      {isError && items.length > 0 ? (
        <div className="mt-6">
          <ErrorState
            title="No pudimos cargar más anuncios"
            description="Revisa tu conexión e inténtalo de nuevo."
            onRetry={() => void refetch()}
          />
        </div>
      ) : null}

      {/* Sentinel del IntersectionObserver */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      {!hasNextPage && items.length > 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Has visto todos los anuncios.
        </p>
      ) : null}
    </div>
  );
}
