"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, DollarSign, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MyListingActions({
  listing,
}: {
  listing: {
    id: string;
    status: string;
  };
}) {
  const router = useRouter();
  const [deleting, startDeleting] = useTransition();
  const [selling, startSelling] = useTransition();

  function markSold() {
    startSelling(async () => {
      try {
        const res = await fetch(`/api/listings/${listing.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "sold" }),
        });
        if (!res.ok) throw new Error(String(res.status));
        toast.success("Anuncio marcado como vendido");
        router.refresh();
      } catch {
        toast.error("No se pudo marcar como vendido");
      }
    });
  }

  function confirmDelete() {
    if (!window.confirm("¿Eliminar este anuncio? Esta acción no se puede deshacer.")) {
      return;
    }
    startDeleting(async () => {
      try {
        const res = await fetch(`/api/listings/${listing.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(String(res.status));
        toast.success("Anuncio eliminado");
        router.refresh();
      } catch {
        toast.error("No se pudo eliminar el anuncio");
      }
    });
  }

  const busy = deleting || selling;
  const isSold = listing.status === "sold";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm">
        <Link href={`/sell?edit=${listing.id}`}>
          <Edit className="size-4" />
          Editar
        </Link>
      </Button>
      {!isSold ? (
        <Button
          variant="outline"
          size="sm"
          onClick={markSold}
          disabled={busy}
        >
          {selling ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <DollarSign className="size-4" />
          )}
          Marcar como vendido
        </Button>
      ) : null}
      <Button
        variant="destructive"
        size="sm"
        onClick={confirmDelete}
        disabled={busy}
      >
        {deleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Eliminar
      </Button>
    </div>
  );
}
