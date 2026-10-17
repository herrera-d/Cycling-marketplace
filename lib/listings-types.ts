import type { Condition } from "@/db/schema";

/**
 * Tipos compartidos entre servidor y cliente.
 *
 * Vive en su propio módulo (sin dependencias de servidor) para que los
 * componentes cliente puedan importarlos sin arrastrar `drizzle`/`neon`.
 */
export type ListingCardData = {
  id: string;
  title: string;
  priceCents: number;
  currency: string;
  condition: Condition;
  location: string | null;
  brand: string | null;
  categorySlug: string;
  categoryName: string;
  imageUrl: string | null;
  createdAt: string;
};

/** Respuesta paginada de `GET /api/listings` y de `getListingsPage`. */
export type ListingsPage = {
  items: ListingCardData[];
  nextCursor: string | null;
  total: number;
};

/** Categoría tal como la consume la UI (filtros, chips). */
export type CategoryOption = {
  id: number;
  name: string;
  slug: string;
  icon: string;
};
