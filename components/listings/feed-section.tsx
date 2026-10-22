import { connection } from "next/server";

import { FeedToolbar } from "@/components/listings/feed-toolbar";
import { Filters } from "@/components/listings/filters";
import { InfiniteFeed } from "@/components/listings/infinite-feed";
import { getCategories } from "@/lib/categories";
import { getListingsPage } from "@/lib/listings";
import { parseListingQuery } from "@/lib/validations";
import { getOptionalUser } from "@/lib/dal";
import { getUserFavoriteIds } from "@/lib/favorites";

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

  const user = await getOptionalUser();
  const [categories, page, favorites] = await Promise.all([
    getCategories(),
    getListingsPage(query),
    user?.id ? getUserFavoriteIds(user.id) : Promise.resolve(new Set<string>()),
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
    <div className="grid gap-8 lg:grid-cols-[264px_1fr] lg:gap-10">
      <Filters categories={categories} activeCount={activeCount} />

      <div className="min-w-0">
        {/* Cabecera de sección: el patrón de "eyebrow" (mayúsculas + tracking)
            es lo que separa un encabezado de diseño de uno por defecto. */}
        <div className="mb-6">
          <p className="text-eyebrow">Anuncios</p>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Encuentra tu próxima pieza
          </h2>
        </div>

        <FeedToolbar total={page.total} />
        <div className="mt-6">
          <InfiniteFeed
            initialData={page}
            query={query}
            favorites={favorites}
            isAuthenticated={Boolean(user?.id)}
          />
        </div>
      </div>
    </div>
  );
}
