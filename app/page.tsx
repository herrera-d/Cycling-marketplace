import Link from "next/link";
import { ArrowRight, Bike, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ListingCardDemo } from "@/components/site/listing-card-demo";

const categories = [
  "Bicicletas",
  "Componentes",
  "Ruedas",
  "Ropa",
  "Calzado",
  "Cascos",
  "Accesorios",
  "Entrenamiento",
  "Herramientas",
];

const demos = [
  {
    title: "Trek Madone SLR 9 2023, talla 56",
    price: "€3.400",
    condition: "Como nuevo",
    emoji: "🚴",
  },
  {
    title: "Grupo Campagnolo Super Record 12v",
    price: "€1.150",
    condition: "Buen estado",
    emoji: "⚙️",
  },
  {
    title: "Casco Aeroad Giro AeroHead MIPS, M",
    price: "€120",
    condition: "Nuevo",
    emoji: "⛑️",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
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
                render={<Link href="/sell" />}
                size="lg"
                className="rounded-full px-8 shadow-sm"
              >
                Publicar artículo
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button
                render={<Link href="/#anuncios" />}
                size="lg"
                variant="outline"
                className="rounded-full px-8"
              >
                Explorar anuncios
              </Button>
            </div>
          </div>
        </section>

        {/* Búsqueda / categorías */}
        <section
          id="categorias"
          className="border-y bg-card/50 py-12"
          aria-label="Categorías"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Explora por categoría
                </h2>
                <p className="text-sm text-muted-foreground">
                  Bollilos, cuadros, rodillos y más
                </p>
              </div>
              <span className="hidden items-center gap-2 text-sm text-muted-foreground sm:inline-flex">
                <Search className="size-4" aria-hidden="true" />
                Los filtros llegarán en la Fase 3
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {categories.map((category) => (
                <span
                  key={category}
                  className="cursor-default rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Demo de anuncios (design system showcase) */}
        <section id="anuncios" className="py-14">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Anuncios destacados
              </h2>
              <p className="text-sm text-muted-foreground">
                Vista previa · feed real en la Fase 3
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {demos.map((demo) => (
                <ListingCardDemo key={demo.title} {...demo} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}