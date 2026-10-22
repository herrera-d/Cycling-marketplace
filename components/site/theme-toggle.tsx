"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

const subscribe = () => () => {};

/**
 * Interruptor claro/oscuro.
 *
 * El tema lo decide `next-themes` en el cliente (script inline antes del
 * pintado), así que el servidor no lo conoce. Hasta que el cliente monta,
 * el `aria-label` se deja genérico para evitar un mismatch de hidratación.
 * Los iconos se resuelven por CSS (`dark:`), no por estado de React.
 */
export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const label = !mounted
    ? "Cambiar tema"
    : isDark
      ? "Cambiar a tema claro"
      : "Cambiar a tema oscuro";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9 rounded-full text-muted-foreground hover:text-foreground"
    >
      <Moon className="hidden size-4 dark:block" aria-hidden="true" />
      <Sun className="size-4 dark:hidden" aria-hidden="true" />
    </Button>
  );
}
