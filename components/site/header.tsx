import Link from "next/link";
import { Bike } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Bike className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            BiciMarket
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <Link
            href="/#categorias"
            className="transition-colors hover:text-foreground"
          >
            Categorías
          </Link>
          <Link
            href="/login"
            className="transition-colors hover:text-foreground"
          >
            Iniciar sesión
          </Link>
        </nav>

        <Button
          nativeButton={false}
          render={<Link href="/sell" />}
          className="rounded-full shadow-sm"
        >
          <span className="hidden sm:inline">Publicar artículo</span>
          <span className="sm:hidden">Publicar</span>
        </Button>
      </div>
    </header>
  );
}