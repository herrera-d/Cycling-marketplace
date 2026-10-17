import type { Condition, Status } from "@/db/schema";

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

/** Datos públicos del vendedor que se muestran en el detalle. */
export type ListingSeller = {
  id: string;
  name: string | null;
  image: string | null;
  /** ISO. Antigüedad en la plataforma. */
  memberSince: string;
};

/** Anuncio completo para la página de detalle (PLAN §5.4). */
export type ListingDetail = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  condition: Condition;
  brand: string | null;
  size: string | null;
  location: string | null;
  status: Status;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  /** URLs en orden (`position` ascendente). Puede venir vacío. */
  images: string[];
  seller: ListingSeller;
  createdAt: string;
};
