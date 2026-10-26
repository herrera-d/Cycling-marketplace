import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback instantáneo de la ficha (`/listings/[id]`).
 *
 * Sin este archivo, al tocar una tarjeta el navegador se quedaba en el feed
 * hasta que el servidor terminaba de leer el anuncio: en 3G eso son varios
 * segundos sin ninguna señal. `loading.tsx` se prefetchea con la ruta y se
 * muestra de inmediato, así el usuario ve que su toque funcionó.
 *
 * El esqueleto replica la estructura real (miga + galería + panel) para que el
 * contenido no "salte" cuando llega.
 */
export default function ListingDetailLoading() {
  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/3] w-full rounded-3xl sm:aspect-[3/2]" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-16 w-20 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-4 w-52" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-9 w-full rounded-full sm:w-36" />
              <Skeleton className="h-9 w-full rounded-full sm:w-48" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
