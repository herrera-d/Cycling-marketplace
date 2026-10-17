import type { Condition } from "@/db/schema";

/**
 * Monedas soportadas por el marketplace. El vendedor elige la moneda al
 * publicar; el precio se guarda en `priceCents` (entero, 2 decimales).
 */
export const CURRENCIES = [
  { code: "ARS", label: "Peso argentino", symbol: "$" },
  { code: "USD", label: "Dólar estadounidense", symbol: "US$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "MXN", label: "Peso mexicano", symbol: "$" },
  { code: "BRL", label: "Real brasileño", symbol: "R$" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "ARS";

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.some((currency) => currency.code === value);
}

/**
 * Formatea un precio guardado en centavos.
 *
 * Nota: el símbolo y su posición los decidimos nosotros (tabla CURRENCIES) y
 * solo delegamos el agrupado de miles en `Intl`. Así el resultado es idéntico
 * en servidor y cliente y evitamos fallos de hidratación por diferencias de ICU.
 */
export function formatPrice(priceCents: number, currency: string): string {
  const code = isCurrencyCode(currency) ? currency : DEFAULT_CURRENCY;
  const { symbol } = CURRENCIES.find((c) => c.code === code)!;
  const amount = Math.round(priceCents) / 100;
  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${symbol} ${formatted}`;
}

/** Etiquetas en español para la condición del artículo. */
export const CONDITION_LABELS: Record<Condition, string> = {
  new: "Nuevo",
  like_new: "Como nuevo",
  good: "Buen estado",
  fair: "Usado",
};

export function conditionLabel(condition: Condition | string): string {
  return CONDITION_LABELS[condition as Condition] ?? String(condition);
}

/** Opciones de orden del feed. El valor viaja en la URL (`?orden=`). */
export const SORT_OPTIONS = [
  { value: "recentes", label: "Más recientes" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "recentes";
