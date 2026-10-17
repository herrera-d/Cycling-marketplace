"use client";

import { cn } from "cn";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CategoryIcon } from "@/components/listings/category-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CONDITION_LABELS } from "@/lib/format";
import type { CategoryOption } from "@/lib/listings-types";
import { useDebouncedUrlValue } from "@/lib/use-debounced-url-value";
import { useListingFilters } from "@/lib/use-listing-filters";

const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS) as [
  keyof typeof CONDITION_LABELS,
  string,
][];

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

/**
 * Campo de búsqueda con debounce.
 *
 * Escribe en la URL con `replace` para no llenar el historial con cada tecla.
 */
export function SearchField({ className }: { className?: string }) {
  const { values, setFilter } = useListingFilters();
  const commit = useCallback(
    (value: string | null) => setFilter("q", value, { replace: true }),
    [setFilter],
  );
  const [search, setSearch] = useDebouncedUrlValue(values.q ?? "", commit, 350);

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar bici, grupo, casco…"
        aria-label="Buscar anuncios"
        className="pl-8"
      />
    </div>
  );
}

/** Controles de filtro compartidos por la barra lateral y el panel móvil. */
function FilterControls({ categories }: { categories: CategoryOption[] }) {
  const { values, setFilter, setFilters, clearAll, hasActiveFilters } =
    useListingFilters();

  const commitMin = useCallback(
    (value: string | null) => setFilter("min", value),
    [setFilter],
  );
  const commitMax = useCallback(
    (value: string | null) => setFilter("max", value),
    [setFilter],
  );

  const [minValue, setMinValue] = useDebouncedUrlValue(
    values.min ?? "",
    commitMin,
    450,
  );
  const [maxValue, setMaxValue] = useDebouncedUrlValue(
    values.max ?? "",
    commitMax,
    450,
  );

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">Categoría</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("categoria", null)}
            aria-pressed={!values.categoria}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              !values.categoria
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "hover:border-primary/40 hover:text-primary",
            )}
          >
            Todas
          </button>
          {categories.map((category) => {
            const active = values.categoria === category.slug;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setFilter("categoria", active ? null : category.slug)
                }
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "hover:border-primary/40 hover:text-primary",
                )}
              >
                <CategoryIcon name={category.icon} className="size-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Separator />

      <div className="grid gap-2">
        <Label htmlFor="feed-condition">Condición</Label>
        <select
          id="feed-condition"
          value={values.condicion ?? ""}
          onChange={(event) => setFilter("condicion", event.target.value || null)}
          className={selectClass}
        >
          <option value="">Cualquiera</option>
          {CONDITION_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium">Precio</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={minValue}
            onChange={(event) => setMinValue(event.target.value)}
            placeholder="Mín"
            aria-label="Precio mínimo"
          />
          <span className="text-muted-foreground" aria-hidden="true">
            –
          </span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            value={maxValue}
            onChange={(event) => setMaxValue(event.target.value)}
            placeholder="Máx"
            aria-label="Precio máximo"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          El precio de cada anuncio está en su propia moneda.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="feed-location">Ubicación</Label>
        <Input
          id="feed-location"
          value={values.ubi ?? ""}
          onChange={(event) =>
            setFilters({ ubi: event.target.value || null })
          }
          placeholder="Ciudad o zona"
        />
      </div>

      {hasActiveFilters ? (
        <Button variant="ghost" className="justify-start" onClick={clearAll}>
          <X className="size-4" aria-hidden="true" />
          Limpiar filtros
        </Button>
      ) : null}
    </div>
  );
}

type FiltersProps = {
  categories: CategoryOption[];
  activeCount: number;
};

/**
 * Filtros del feed (PLAN §5.3 / §6.2): barra lateral fija en escritorio y
 * panel deslizante en móvil. El estado vive en la URL.
 */
export function Filters({ categories, activeCount }: FiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Escritorio: barra lateral sticky */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border bg-card p-5">
          <SearchField />
          <FilterControls categories={categories} />
        </div>
      </aside>

      {/* Móvil / tablet: buscador + panel de filtros */}
      <div className="flex items-center gap-2 lg:hidden">
        <SearchField className="flex-1" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(buttonVariants({ variant: "outline" }), "shrink-0 rounded-full")}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filtros
            {activeCount > 0 ? (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {activeCount}
              </span>
            ) : null}
          </SheetTrigger>
          <SheetContent side="left" className="w-80 max-w-[85vw] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-8">
              <FilterControls categories={categories} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
