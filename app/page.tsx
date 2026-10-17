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
        <div className="sticky top-24 h-[420px] rounded-2xl border bg-card" />
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
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-medium text-muted-foreground shadow-xs">
              <Bike className="size-4 text-primary" aria-hidden="true" />
              La comunidad ciclista compra y vende aquí
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Equipo de ciclismo de{" "}
              <span className="text-primary">segunda mano</span>, sin comisiones
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Publica tu bici o encuentra esa pieza que llevas buscando. Todo en
              un solo lugar, de manera simple y segura.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
                className="rounded-full px-8"
              >
                Explorar anuncios
              </Button>
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
