import { connection } from "next/server";

import { FeedToolbar } from "@/components/listings/feed-toolbar";
import { Filters } from "@/components/listings/filters";
import { InfiniteFeed } from "@/components/listings/infinite-feed";
import { getCategories } from "@/lib/categories";
import { getListingsPage } from "@/lib/listings";
import { parseListingQuery } from "@/lib/validations";

/**
 * Sección del feed (PLAN §5.2).
 *
 * Se renderiza en el servidor: la primera página llega en el HTML (SEO sin
 * parpadeo) y el cliente continúa con `useInfiniteQuery`.
 */
export async function FeedSection({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Datos en vivo: garantiza render por petición bajo `cacheComponents`.
  await connection();

  const raw = await searchParams;
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }

  // `parseListingQuery` normaliza los filtros y **descarta el `cursor`**: la
  // primera página la sirve el servidor y el cliente continúa desde ahí con
  // su propia clave de consulta. Aceptar el `cursor` de la URL haría que el
  // HTML inicial mostrara una página de continuación inconsistente con el
  // cliente (y expondría el parseo del cursor a entradas manipuladas).
  const query = parseListingQuery(flat);

  const [categories, page] = await Promise.all([
    getCategories(),
    getListingsPage(query),
  ]);

  const activeCount = [
    query.categoria,
    query.q,
    query.min,
    query.max,
    query.condicion,
    query.ubi,
  ].filter((value) => value !== undefined && value !== "").length;

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <Filters categories={categories} activeCount={activeCount} />

      <div className="min-w-0">
        <FeedToolbar total={page.total} />
        <div className="mt-6">
          <InfiniteFeed initialData={page} query={query} />
        </div>
      </div>
    </div>
  );
}
