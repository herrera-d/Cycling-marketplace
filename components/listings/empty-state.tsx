"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title?: string;
  description?: string;
  /** Si se pasa, muestra el botón "Limpiar filtros". */
  onClear?: () => void;
  /** Si se pasa, muestra un CTA con enlace. */
  actionHref?: string;
  actionLabel?: string;
};

/** Estado vacío del feed (sin resultados). */
export function EmptyState({
  title = "No encontramos anuncios",
  description = "Prueba con otros filtros o términos de búsqueda.",
  onClear,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {onClear ? (
        <Button className="mt-6 rounded-full" variant="outline" onClick={onClear}>
          Limpiar filtros
        </Button>
      ) : null}
      {actionHref && actionLabel ? (
        <Button className="mt-6 rounded-full">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}