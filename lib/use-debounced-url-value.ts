"use client";

import { useEffect, useState } from "react";

/**
 * Input de texto sincronizado con un valor de la URL, con debounce.
 *
 * - Mantiene un borrador local mientras se escribe (para que el campo no
 *   pierda el foco ni el cursor) y confirma el valor a la URL tras una pausa.
 * - Si la URL cambia por otra vía (p. ej. "Limpiar filtros"), el borrador se
 *   reajusta durante el render con el patrón oficial de React
 *   ("adjusting state when a prop changes"), sin efectos ni renders en cascada.
 */
export function useDebouncedUrlValue(
  urlValue: string,
  commit: (value: string | null) => void,
  delay = 350,
) {
  const [value, setValue] = useState(urlValue);
  const [syncedValue, setSyncedValue] = useState(urlValue);

  if (urlValue !== syncedValue) {
    setSyncedValue(urlValue);
    setValue(urlValue);
  }

  useEffect(() => {
    if (value === urlValue) return;
    const timer = setTimeout(() => {
      commit(value.trim() || null);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, urlValue, commit, delay]);

  return [value, setValue] as const;
}
