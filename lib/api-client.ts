import type { ListingsPage } from "@/lib/listings-types";
import type { ListingQuery } from "@/lib/validations";

/** Traduce el estado de filtros a los parámetros de `GET /api/listings`. */
export function buildListingsSearchParams(
  query: ListingQuery,
  cursor?: string | null,
): URLSearchParams {
  const params = new URLSearchParams();
  if (query.categoria) params.set("categoria", query.categoria);
  if (query.q) params.set("q", query.q);
  if (query.min !== undefined) params.set("min", String(query.min));
  if (query.max !== undefined) params.set("max", String(query.max));
  if (query.condicion) params.set("condicion", query.condicion);
  if (query.ubi) params.set("ubi", query.ubi);
  if (query.orden && query.orden !== "recentes") params.set("orden", query.orden);
  if (query.limit) params.set("limit", String(query.limit));
  if (cursor) params.set("cursor", cursor);
  return params;
}

/** Descarga una página del feed desde el cliente (infinite scroll). */
export async function fetchListingsPage(
  query: ListingQuery,
  cursor: string | null,
  signal?: AbortSignal,
): Promise<ListingsPage> {
  const params = buildListingsSearchParams(query, cursor);
  const response = await fetch(`/api/listings?${params.toString()}`, { signal });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los anuncios");
  }

  return (await response.json()) as ListingsPage;
}
