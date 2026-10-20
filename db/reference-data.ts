import type { NewCategory } from "./schema";

/**
 * Datos de **referencia** del marketplace (PLAN §4).
 *
 * No son datos de demostración: son las categorías que la app necesita para
 * funcionar (el feed filtra por ellas y el formulario de publicación las lista).
 * Por eso este mismo listado se siembra también en **producción** (con
 * `SEED_ONLY=categories`), mientras que el seed de demo (vendedor + anuncios)
 * queda bloqueado allí. Ver `db/seed.ts` y `db/env.ts`.
 *
 * El campo `icon` guarda el nombre de un icono de lucide-react (kebab-case).
 */
export const CATEGORIES: NewCategory[] = [
  { name: "Bicicletas", slug: "bicicletas", icon: "bike" },
  { name: "Componentes", slug: "componentes", icon: "cog" },
  { name: "Ruedas", slug: "ruedas", icon: "circle-dot" },
  { name: "Ropa", slug: "ropa", icon: "shirt" },
  { name: "Calzado", slug: "calzado", icon: "footprints" },
  { name: "Cascos", slug: "cascos", icon: "hard-hat" },
  { name: "Accesorios", slug: "accesorios", icon: "backpack" },
  { name: "Entrenamiento", slug: "entrenamiento", icon: "activity" },
  { name: "Herramientas", slug: "herramientas", icon: "wrench" },
];
