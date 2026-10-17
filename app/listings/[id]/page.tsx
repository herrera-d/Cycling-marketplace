import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";

import { CategoryIcon } from "@/components/listings/category-icon";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { SellerCard } from "@/components/listings/seller-card";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getOptionalUser } from "@/lib/dal";
import { isListingFavorite } from "@/lib/favorites";
import { conditionLabel, formatPrice } from "@/lib/format";
import { getListingById, getListingsPage } from "@/lib/listings";
import { listingIdSchema, listingQuerySchema } from "@/lib/validations";

const DATE_FORMAT = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Metadata dinámica (PLAN §9.1 Fase 4): título, descripción y `og:image`. */
export async function generateMetadata({
  params,
}: PageProps<"/listings/[id]">): Promise<Metadata> {
  const { id } = await params;
  const parsed = listingIdSchema.safeParse(id);
  if (!parsed.success) return { title: "Anuncio no encontrado" };

  const listing = await getListingById(parsed.data);
  if (!listing) return { title: "Anuncio no encontrado" };

  const price = formatPrice(listing.priceCents, listing.currency);
  const description =
    listing.description.length > 160
      ? `${listing.description.slice(0, 157)}…`
      : listing.description;
  const cover = listing.images[0];

  return {
    title: `${listing.title} — ${price}`,
    description,
    alternates: { canonical: `/listings/${listing.id}` },
    openGraph: {
      title: `${listing.title} — BiciMarket`,
      description,
      type: "article",
      images: cover ? [{ url: cover, alt: listing.title }] : undefined,
    },
  };
}

/**
 * La ruta depende de `params` y de la BD, así que bloquea en el servidor
 * (`instant = false`). Así la respuesta es un 404 real para ids inexistentes
 * (importante para SEO) en lugar de un shell ya enviado con estado 200.
 */
export const instant = false;

export default async function ListingDetailPage({
  params,
}: PageProps<"/listings/[id]">) {
  // Datos en vivo (BD + sesión): render por petición bajo `cacheComponents`.
  await connection();

  const { id } = await params;
  const parsed = listingIdSchema.safeParse(id);
  if (!parsed.success) notFound();

  // El anuncio y la sesión son independientes: se resuelven en paralelo.
  const [listing, user] = await Promise.all([
    getListingById(parsed.data),
    getOptionalUser(),
  ]);
  if (!listing) notFound();

  // "Más de esta categoría": hasta 4 anuncios, excluyendo el actual.
  const relatedQuery = listingQuerySchema.parse({
    categoria: listing.categorySlug,
    limit: 5,
  });
  const [isFavorite, relatedPage] = await Promise.all([
    user?.id ? isListingFavorite(user.id, listing.id) : Promise.resolve(false),
    getListingsPage(relatedQuery),
  ]);
  const related = relatedPage.items
    .filter((item) => item.id !== listing.id)
    .slice(0, 4);

  const details: Array<{ label: string; value: string }> = [
    { label: "Categoría", value: listing.categoryName },
    { label: "Condición", value: conditionLabel(listing.condition) },
    ...(listing.brand ? [{ label: "Marca", value: listing.brand }] : []),
    ...(listing.size ? [{ label: "Talla", value: listing.size }] : []),
    ...(listing.location
      ? [{ label: "Ubicación", value: listing.location }]
      : []),
  ];

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Miga de pan */}
        <nav
          aria-label="Miga de pan"
          className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <ChevronRight className="size-4" aria-hidden="true" />
          <Link
            href={`/?categoria=${listing.categorySlug}`}
            className="transition-colors hover:text-foreground"
          >
            {listing.categoryName}
          </Link>
          <ChevronRight className="size-4" aria-hidden="true" />
          <span className="truncate font-medium text-foreground">
            {listing.title}
          </span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
          {/* Galería */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ListingGallery images={listing.images} title={listing.title} />
          </div>

          {/* Panel de información */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {conditionLabel(listing.condition)}
              </Badge>
              <Badge variant="outline">
                <CategoryIcon name={listing.categoryIcon} className="size-3" />
                {listing.categoryName}
              </Badge>
              {listing.status === "sold" ? (
                <Badge variant="destructive">Vendido</Badge>
              ) : null}
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {listing.title}
              </h1>
              <p className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {formatPrice(listing.priceCents, listing.currency)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {listing.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {listing.location}
                </span>
              ) : null}
              <span>Publicado el {DATE_FORMAT.format(new Date(listing.createdAt))}</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <FavoriteButton
                listingId={listing.id}
                initialFavorite={isFavorite}
                isAuthenticated={Boolean(user?.id)}
              />
              <Button
                nativeButton={false}
                render={<Link href={`/?categoria=${listing.categorySlug}`} />}
                variant="ghost"
                size="lg"
                className="rounded-full"
              >
                Ver más de {listing.categoryName}
              </Button>
            </div>

            <Separator />

            <section aria-labelledby="descripcion">
              <h2 id="descripcion" className="text-lg font-semibold">
                Descripción
              </h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">
                {listing.description}
              </p>
            </section>

            <Separator />

            <section aria-labelledby="detalles">
              <h2 id="detalles" className="text-lg font-semibold">
                Detalles
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-center justify-between gap-4 border-b py-2 last:border-b-0 sm:border-b-0 sm:py-0"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {detail.label}
                    </dt>
                    <dd className="text-sm font-medium">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <Separator />

            <section aria-labelledby="vendedor">
              <h2 id="vendedor" className="text-lg font-semibold">
                Vendedor
              </h2>
              <div className="mt-3">
                <SellerCard seller={listing.seller} />
              </div>
            </section>
          </div>
        </div>

        {/* Relacionados */}
        {related.length > 0 ? (
          <section
            aria-labelledby="relacionados"
            className="mt-16 border-t pt-10"
          >
            <h2 id="relacionados" className="text-xl font-semibold tracking-tight">
              Más de {listing.categoryName}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {related.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </>
  );
}
