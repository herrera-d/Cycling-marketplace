import { Suspense } from "react";
import { PackagePlus } from "lucide-react";

import { SellForm } from "@/components/listings/sell-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getCategories } from "@/lib/categories";
import { verifySession } from "@/lib/dal";

export const metadata = {
  title: "Publicar artículo",
  description: "Publica tu bici o componentes en BiciMarket.",
};

/**
 * Ruta protegida (Fase 2) con el asistente de publicación (Fase 5).
 *
 * La sesión se vuelve a validar en el servidor junto a los datos: el `proxy.ts`
 * es solo la primera barrera.
 */
export default function SellPage() {
  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <PackagePlus className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Publicá tu artículo
            </h1>
            <p className="text-sm text-muted-foreground">
              Tres pasos rápidos y ya está en el feed.
            </p>
          </div>
        </div>

        <Suspense fallback={<SellSkeleton />}>
          <SellContent />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

async function SellContent() {
  const { user } = await verifySession();
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-sm text-muted-foreground shadow-sm">
        No hay categorías disponibles. Volvé a intentar más tarde.
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Hola{user.name ? `, ${user.name.split(" ")[0]}` : ""} 👋 Completá los
        datos y publicá tu artículo.
      </p>
      <SellForm categories={categories} />
    </>
  );
}

function SellSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[28rem] animate-pulse rounded-3xl border bg-card shadow-sm"
    />
  );
}
