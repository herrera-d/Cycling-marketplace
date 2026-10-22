import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Bike } from "lucide-react";

import { FeedSection } from "@/components/listings/feed-section";
import { ListingGridSkeleton } from "@/components/listings/listing-card-skeleton";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Marketplace de ciclismo de segunda mano",
  description:
    "Compra y vende bicicletas, componentes y equipo de ciclismo de segunda mano. Publicar es gratis y sin comisiones.",
  openGraph: {
    title: "BiciMarket — Marketplace de ciclismo",
    description:
      "Bicicletas, componentes y equipo de ciclismo de segunda mano.",
    type: "website",
  },
};

/** Fallback del feed mientras el servidor resuelve la primera página. */
function FeedFallback() {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <div className="hidden lg:block">
        <div className="sticky top-24 h-[420px] rounded-2xl border border-border bg-card" />
      </div>
      <div className="min-w-0">
        <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
        <div className="mt-6">
          <ListingGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          {/* Halos de luz: el aire atmosférico de la referencia. Sin ellos el
              fondo queda plano y el hero se lee como "template". */}
          <div
            aria-hidden="true"
            className="glow-muted pointer-events-none absolute inset-x-0 -top-56 h-[640px]"
          />
          <div
            aria-hidden="true"
            className="glow-accent pointer-events-none absolute left-1/2 top-0 h-[560px] w-[min(1100px,125%)] -translate-x-1/2"
          />

          <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-[0.8125rem] font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
                <Bike className="size-4 text-primary" aria-hidden="true" />
                La comunidad ciclista compra y vende aquí
              </span>

              <h1 className="mt-7 font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Equipo de ciclismo de{" "}
                <span className="text-primary">segunda mano</span>, sin
                comisiones
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Publica tu bici o encuentra esa pieza que llevas buscando. Todo
                en un solo lugar, de manera simple y segura.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  nativeButton={false}
                  render={<Link href="/sell" />}
                  size="lg"
                  className="rounded-full px-8 shadow-sm"
                >
                  Publicar artículo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="#anuncios" />}
                  size="lg"
                  variant="outline"
                  className="rounded-full border-border bg-card/60 px-8 backdrop-blur-sm"
                >
                  Explorar anuncios
                </Button>
              </div>

              {/* Cifras de confianza: la "prueba social" compacta que usa la
                  referencia bajo el hero. */}
              <dl className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-6">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Publicar
                  </dt>
                  <dd className="mt-1.5 font-heading text-2xl font-bold">
                    Gratis
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Comisiones
                  </dt>
                  <dd className="mt-1.5 font-heading text-2xl font-bold">0%</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Categorías
                  </dt>
                  <dd className="mt-1.5 font-heading text-2xl font-bold">10</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section
          id="anuncios"
          aria-label="Anuncios"
          className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8"
        >
          <Suspense fallback={<FeedFallback />}>
            <FeedSection searchParams={searchParams} />
          </Suspense>
        </section>
      </main>

      <Footer />
    </>
  );
}
