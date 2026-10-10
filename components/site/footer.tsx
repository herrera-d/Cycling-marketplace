import Link from "next/link";
import { Bike } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Bike className="size-4" aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight">BiciMarket</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Marketplace de ciclismo · Compra y vende de forma segura
        </p>
        <nav className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <Link
            href="/login"
            className="transition-colors hover:text-foreground"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </footer>
  );
}