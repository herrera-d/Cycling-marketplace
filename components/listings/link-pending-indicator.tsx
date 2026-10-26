"use client";

import { useLinkStatus } from "next/link";

import { cn } from "cn";

/**
 * Feedback inmediato al pulsar una tarjeta (móvil / 3G).
 *
 * `useLinkStatus` expone el estado `pending` de la navegación del `<Link>`
 * padre. Antes de que la ruta destino esté lista (prefetch incompleto o
 * conexión lenta) no había ninguna señal visual: el usuario no sabía si su
 * toque se había registrado. Este overlay se renderiza siempre —con opacidad
 * 0— para no introducir layout shift, y se muestra sólo mientras la navegación
 * está pendiente.
 *
 * Debe ser descendiente de un `<Link>`; es intencionadamente diminuto (spinner
 * CSS) para no cargar JS de terceros ni animaciones costosas.
 */
export function LinkPendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/55 transition-opacity duration-150 ease-out",
        pending ? "opacity-100" : "opacity-0",
      )}
    >
      <span
        className={cn(
          "size-6 rounded-full border-2 border-primary border-t-transparent",
          pending && "animate-spin",
        )}
      />
    </span>
  );
}
