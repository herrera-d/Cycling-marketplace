import {
  Activity,
  Backpack,
  Bike,
  CircleDot,
  Cog,
  Footprints,
  HardHat,
  Shirt,
  Tag,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Mapa de iconos de categoría.
 *
 * `categories.icon` guarda el nombre kebab-case de un icono de lucide
 * (ver `db/seed.ts`). Los nombres viven en la base de datos, así que aquí
 * traducimos a componentes reales con un fallback.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  bike: Bike,
  cog: Cog,
  "circle-dot": CircleDot,
  shirt: Shirt,
  footprints: Footprints,
  "hard-hat": HardHat,
  backpack: Backpack,
  activity: Activity,
  wrench: Wrench,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[name] ?? Tag;
  return <Icon className={className} aria-hidden="true" />;
}
