import { Heart } from "lucide-react";


import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingCard } from "@/components/listings/listing-card";
import { verifySession } from "@/lib/dal";
import { getUserFavorites } from "@/lib/favorites";
import { connection } from "next/server";

export const metadata = {
  title: "Mis favoritos",
  description: "Tus anuncios guardados en BiciMarket.",
};

export const instant = false;

export default async function FavoritesPage() {
  await connection();
  const { user } = await verifySession();

  const favorites = await getUserFavorites(user.id);

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Heart className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Favoritos</h1>
            <p className="text-sm text-muted-foreground">
              Los anuncios que guardaste para mirar más adelante.
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <EmptyState
            title="Todavía no tenés favoritos"
            description="Guardá anuncios con el corazón para tenerlos acá."
            actionHref="/"
            actionLabel="Explorar anuncios"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {favorites.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite
                isAuthenticated
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

