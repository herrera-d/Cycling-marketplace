import Link from "next/link";
import { SearchX } from "lucide-react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Button } from "@/components/ui/button";

/**
 * 404 del detalle (PLAN §9.1 Fase 4): id inexistente, id malformado o anuncio
 * no público.
 */
export default function ListingNotFound() {
  return (
    <>
      <Header />

      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex max-w-md flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="size-7" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Error 404
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Este anuncio ya no está disponible
          </h1>
          <p className="mt-2 text-muted-foreground">
            Puede que se haya vendido, retirado o que el enlace sea incorrecto.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              size="lg"
              className="rounded-full"
            >
              Explorar anuncios
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
