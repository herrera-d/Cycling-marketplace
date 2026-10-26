import { Suspense } from "react";
import Link from "next/link";
import { Bike } from "lucide-react";

import { HeaderAuth } from "@/components/site/header-auth";
import { HeaderSearch } from "@/components/site/header-search";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";

/**
 * Shell estático del header (logo + navegación + CTA).
 * El estado de sesión se resuelve aparte, tras un `<Suspense>`, para que el
 * resto de la página se pueda prerenderizar con `cacheComponents`.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 md:bg-background/80 md:backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform duration-200 group-hover:scale-105">
              <Bike className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              BiciMarket
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            <Link
              href="/"
              className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Inicio
            </Link>
            <Link
              href="/#categorias"
              className="rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Categorías
            </Link>
          </nav>
        </div>

        <HeaderSearch />

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button
            nativeButton={false}
            render={<Link href="/sell" />}
            className="rounded-full px-4 shadow-sm"
          >
            <span className="hidden sm:inline">Publicar artículo</span>
            <span className="sm:hidden">Publicar</span>
          </Button>

          <Suspense fallback={<HeaderAuthFallback />}>
            <HeaderAuth />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

function HeaderAuthFallback() {
  return (
    <div
      aria-hidden="true"
      className="h-9 w-9 animate-pulse rounded-full bg-muted"
    />
  );
}
