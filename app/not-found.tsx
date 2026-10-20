import Link from "next/link";
import { SearchX } from "lucide-react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Página no encontrada
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          No encontramos la página que buscás. Probá volver al feed o publicar un artículo.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button>
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button variant="outline">
            <Link href="/sell">Publicar artículo</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
