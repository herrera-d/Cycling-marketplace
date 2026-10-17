"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

/** Estado de error del feed, con reintento. */
export function ErrorState({
  title = "Algo salió mal",
  description = "No pudimos cargar los anuncios. Inténtalo de nuevo.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-20 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {onRetry ? (
        <Button className="mt-6 rounded-full" onClick={onRetry}>
          <RotateCw className="size-4" aria-hidden="true" />
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
