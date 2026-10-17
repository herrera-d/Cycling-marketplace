"use client";

import { ArrowUpDown } from "lucide-react";

import { SORT_OPTIONS } from "@/lib/format";
import { useListingFilters } from "@/lib/use-listing-filters";

const selectClass =
  "h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

type FeedToolbarProps = {
  total: number;
  /** El buscador y los filtros móviles viven junto a la barra. */
  children?: React.ReactNode;
};

/** Cabecera del feed: recuento, buscador móvil, filtros y orden. */
export function FeedToolbar({ total, children }: FeedToolbarProps) {
  const { values, setFilter, isPending } = useListingFilters();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        {children}
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {isPending ? (
            "Actualizando…"
          ) : (
            <>
              <span className="font-medium text-foreground">{total}</span>{" "}
              {total === 1 ? "anuncio" : "anuncios"}
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="feed-sort"
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <ArrowUpDown className="size-4" aria-hidden="true" />
          Ordenar
        </label>
        <select
          id="feed-sort"
          value={values.orden ?? "recentes"}
          onChange={(event) => setFilter("orden", event.target.value)}
          className={selectClass}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
