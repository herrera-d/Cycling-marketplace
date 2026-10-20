import { connection } from "next/server";
import Link from "next/link";
import { Package, PlusCircle } from "lucide-react";
import Image from "next/image";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/listings/empty-state";
import { verifySession } from "@/lib/dal";
import { getUserListings } from "@/lib/listings";
import { formatPrice } from "@/lib/format";
import { MyListingActions } from "@/components/listings/my-listing-actions";

export const metadata = {
  title: "Mis artículos",
  description: "Gestiona tus anuncios publicados en BiciMarket.",
};

function statusLabel(status: string) {
  if (status === "sold") return "Vendido";
  if (status === "draft") return "Borrador";
  return "Activo";
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "sold") return "secondary";
  if (status === "active") return "default";
  return "outline";
}

export const instant = false;

export default async function MyArticlesPage() {
  await connection();
  const { user } = await verifySession();

  const listings = await getUserListings(user.id);

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Package className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mis artículos</h1>
              <p className="text-sm text-muted-foreground">
                Gestioná tus anuncios: editá, marcá como vendido o eliminá.
              </p>
            </div>
          </div>
          <Button>
            <Link href="/sell">
              <PlusCircle className="size-4" />
              Publicar nuevo
            </Link>
          </Button>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            title="Aún no tenés anuncios"
            description="Publicá tu primer artículo para venderlo en BiciMarket."
            actionHref="/sell"
            actionLabel="Publicar artículo"
          />
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="relative aspect-square size-20 overflow-hidden rounded-lg bg-muted">
                    {listing.imageUrl ? (
                      <Image
                        src={listing.imageUrl}
                        alt={listing.title}
                        width={80}
                        height={80}
                        sizes="80px"
                        className="absolute inset-0 size-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Package className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="line-clamp-1 font-medium hover:underline"
                    >
                      {listing.title}
                    </Link>
                    <p className="mt-1 text-sm font-semibold">
                      {formatPrice(listing.priceCents, listing.currency)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(listing.status)}>
                        {statusLabel(listing.status)}
                      </Badge>
                      {listing.location ? (
                        <Badge variant="outline">{listing.location}</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <MyListingActions listing={listing} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
