"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

import { parseListingQuery, type ListingQuery } from "@/lib/validations";

/** Claves que forman parte del estado de filtros del feed. */
export const FILTER_KEYS = [
  "categoria",
  "q",
  "min",
  "max",
  "condicion",
  "ubi",
  "orden",
] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

export type FilterValues = Partial<Record<FilterKey, string | null>>;

type SetFilterOptions = {
  /** `true` sustituye la entrada de historial (útil al teclear). */
  replace?: boolean;
};

/**
 * Sincroniza el estado de filtros con la URL.
 *
 * - Cambios discretos (categoría, orden, condición, precio, ubicación) usan
 *   `push`: el botón "atrás" del navegador restaura el filtro anterior.
 * - El texto de búsqueda usa `replace` (con debounce) para no llenar el
 *   historial con cada pulsación.
 * - Cualquier cambio reinicia la paginación (se elimina `cursor`).
 */
export function useListingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const values: FilterValues = useMemo(() => {
    const out: FilterValues = {};
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value) out[key] = value;
    }
    return out;
  }, [searchParams]);

  const query: ListingQuery = useMemo(
    () => parseListingQuery(values),
    [values],
  );

  const setFilter = useCallback(
    (key: FilterKey, value: string | null, options?: SetFilterOptions) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.delete("cursor"); // nueva consulta → empezar de cero

      const search = next.toString();
      const url = search ? `${pathname}?${search}` : pathname;
      const navigate = options?.replace ? router.replace : router.push;
      startTransition(() => navigate(url, { scroll: false }));
    },
    [pathname, router, searchParams],
  );

  const setFilters = useCallback(
    (updates: FilterValues, options?: SetFilterOptions) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      next.delete("cursor");

      const search = next.toString();
      const url = search ? `${pathname}?${search}` : pathname;
      const navigate = options?.replace ? router.replace : router.push;
      startTransition(() => navigate(url, { scroll: false }));
    },
    [pathname, router, searchParams],
  );

  const clearAll = useCallback(() => {
    startTransition(() => router.push(pathname, { scroll: false }));
  }, [pathname, router]);

  const activeCount = useMemo(
    () =>
      FILTER_KEYS.filter(
        (key) => key !== "orden" && Boolean(values[key]),
      ).length,
    [values],
  );

  const hasActiveFilters = activeCount > 0;

  return {
    values,
    query,
    setFilter,
    setFilters,
    clearAll,
    activeCount,
    hasActiveFilters,
    isPending,
  };
}
