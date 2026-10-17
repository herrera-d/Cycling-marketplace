"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";

/**
 * Buscador del header (PLAN §6.2).
 *
 * Envía la búsqueda al feed (`/?q=…`). Es un formulario real (funciona con
 * Enter) y no depende de `useSearchParams`, para no forzar un `<Suspense>` en
 * el shell del header bajo `cacheComponents`.
 */
export function HeaderSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      role="search"
      className="relative hidden w-full max-w-md md:block"
      onSubmit={(event) => {
        event.preventDefault();
        const term = value.trim();
        router.push(term ? `/?q=${encodeURIComponent(term)}` : "/");
      }}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar bicis, componentes, ropa…"
        aria-label="Buscar en BiciMarket"
        className="h-9 rounded-full bg-muted/60 pl-9"
      />
    </form>
  );
}
