import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, MapPin } from "lucide-react";

import { CategoryIcon } from "@/components/listings/category-icon";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingGridSkeleton } from "@/components/listings/listing-card-skeleton";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { SellerCard } from "@/components/listings/seller-card";
import { ShareWhatsAppButton } from "@/components/listings/share-whatsapp-button";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Usamos el optimizador de Next para reducir el tamaño de la imagen OG
  // sin duplicar archivos en Supabase (evita gastar el storage del tier gratuito).
  // Si algún día se alcanza el límite de Vercel Image Optimization, los og:image
  // pueden fallar: aquí tenemos fallback al original o a una imagen estática.
  let ogImageUrl: string | undefined = cover;
  if (cover) {
    try {
      ogImageUrl = `/_next/image?url=${encodeURIComponent(cover)}&w=1200&q=75`;
      if (process.env.NODE_ENV === "development") {
        console.debug(`[og:image] listing=${listing.id} optimized=${ogImageUrl}`);
      }
    } catch (error) {
      console.error(
        "[og:image] No se pudo construir la URL del optimizador de Next, usando imagen original.",
        { listingId: listing.id, error },
      );
      ogImageUrl = cover;
    }
  }

  const images = ogImageUrl
    ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: listing.title,
        },
      ]
    : undefined;

  const twitterImages = ogImageUrl ? [ogImageUrl] : undefined;

  return {
    title: `${listing.title} — ${price}`,
    description,
    alternates: { canonical: `/listings/${listing.id}` },
    openGraph: {
      title: `${listing.title} — BiciMarket`,
      description,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${listing.title} — BiciMarket`,
      description,
      images: twitterImages,
    },
  };
}

/**
 * La ruta depende de `params` y de la BD, así que se renderiza por petición
 * bajo `cacheComponents` (`connection()`). `instant = false` sólo desactiva la
 * validación de navegaciones instantáneas en desarrollo; no cambia el status
 * HTTP (el shell con `loading.tsx` se sirve antes de resolver el anuncio).
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

  // El anuncio es lo único que bloquea el primer render. La sesión, el estado
  // de favorito y los relacionados se resuelven en sus propios `<Suspense>`:
  // en 3G eso evita esperar 3–4 round trips a la BD antes de ver la ficha.
  const listing = await getListingById(parsed.data);
  if (!listing) notFound();

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
              {listing.location ? (
                <Badge variant="outline">
                  <MapPin className="size-3" aria-hidden="true" />
                  {listing.location}
                </Badge>
              ) : null}
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
              <span>
                Publicado el {DATE_FORMAT.format(new Date(listing.createdAt))}
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {/* El estado de favorito requiere una consulta extra: se
                  transmite sin bloquear el precio ni la galería. */}
              <Suspense
                fallback={
                  <Skeleton className="h-9 w-full rounded-full sm:w-36" />
                }
              >
                <FavoriteSection listingId={listing.id} />
              </Suspense>
              <ShareWhatsAppButton
                title={listing.title}
                price={formatPrice(listing.priceCents, listing.currency)}
                url={`https://cycling-marketplace-staging.vercel.app/listings/${listing.id}`}
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

        {/* Relacionados: no son críticos para la ficha y añaden otra ronda de
            consultas. Se transmiten aparte para no retrasar el primer render. */}
        <Suspense fallback={<RelatedSkeleton />}>
          <RelatedListings
            listingId={listing.id}
            categorySlug={listing.categorySlug}
            categoryName={listing.categoryName}
          />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

/** Estado de favorito (sesión + consulta), aislado en su propio Suspense. */
async function FavoriteSection({ listingId }: { listingId: string }) {
  const user = await getOptionalUser();
  const isFavorite = user?.id
    ? await isListingFavorite(user.id, listingId)
    : false;

  return (
    <FavoriteButton
      listingId={listingId}
      initialFavorite={isFavorite}
      isAuthenticated={Boolean(user?.id)}
    />
  );
}

/** "Más de esta categoría" (hasta 4), tolerante a fallos. */
async function RelatedListings({
  listingId,
  categorySlug,
  categoryName,
}: {
  listingId: string;
  categorySlug: string;
  categoryName: string;
}) {
  const relatedQuery = listingQuerySchema.parse({
    categoria: categorySlug,
    limit: 5,
  });

  let related: Awaited<ReturnType<typeof getListingsPage>>["items"] = [];
  try {
    const page = await getListingsPage(relatedQuery);
    related = page.items.filter((item) => item.id !== listingId).slice(0, 4);
  } catch {
    // Los relacionados son secundarios: un fallo aquí no debe romper la ficha.
    return null;
  }

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="relacionados" className="mt-16 border-t pt-10">
      <h2 id="relacionados" className="text-xl font-semibold tracking-tight">
        Más de {categoryName}
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {related.map((item) => (
          <ListingCard key={item.id} listing={item} />
        ))}
      </div>
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="mt-16 border-t pt-10"
    >
      <Skeleton className="h-6 w-56" />
      <div className="mt-6">
        <ListingGridSkeleton count={4} />
      </div>
    </section>
  );
}
