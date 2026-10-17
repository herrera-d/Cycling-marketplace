"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

import { cn } from "cn";

/**
 * Galería del detalle (PLAN §5.4 / §6.2): imagen grande + miniaturas.
 *
 * - Imagen principal 4:3 (3:2 en pantallas grandes) con `object-cover`.
 * - Miniaturas clicables; se ocultan si solo hay una imagen.
 * - Flechas y navegación por teclado (←/→) cuando hay más de una.
 */
export function ListingGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const total = images.length;
  const hasMany = total > 1;
  const current = images[Math.min(active, Math.max(total - 1, 0))] ?? null;

  function go(delta: number) {
    setActive((prev) => (prev + delta + total) % total);
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-3xl border bg-muted sm:aspect-[3/2]"
        onKeyDown={(event) => {
          if (!hasMany) return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            go(1);
          }
        }}
      >
        {current ? (
          <Image
            key={current}
            src={current}
            alt={title}
            fill
            /* `priority` está deprecado en Next 16: la imagen principal (LCP)
               se marca como `eager` + `fetchPriority="high"`. */
            loading={active === 0 ? "eager" : "lazy"}
            fetchPriority={active === 0 ? "high" : "auto"}
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-12" aria-hidden="true" />
          </div>
        )}

        {hasMany ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-background backdrop-blur-sm">
              {active + 1} / {total}
            </span>
          </>
        ) : null}
      </div>

      {hasMany ? (
        <ul
          aria-label="Miniaturas del anuncio"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {images.map((image, index) => (
            <li key={image} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Ver imagen ${index + 1} de ${total}`}
                aria-current={index === active}
                className={cn(
                  "relative aspect-square size-16 overflow-hidden rounded-xl border transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-20",
                  index === active
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-80 hover:opacity-100",
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
