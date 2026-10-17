"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Estado de error a nivel de página (App Router `error.tsx`).
 *
 * Cubre fallos del renderizado en servidor —donde el estado de error del feed
 * (cliente) no llega— con el mismo lenguaje visual que el resto de la app.
 */
export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div
        role="alert"
        className="flex max-w-md flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Algo salió mal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          No pudimos cargar esta página. Vuelve a intentarlo; si el problema
          persiste, avísanos.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button className="rounded-full" onClick={() => reset()}>
            <RotateCw className="size-4" aria-hidden="true" />
            Reintentar
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/" />}
            className="rounded-full"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </main>
  );
}
