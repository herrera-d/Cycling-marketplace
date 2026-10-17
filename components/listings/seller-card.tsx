import { BadgeCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ListingSeller } from "@/lib/listings-types";

/** Formatea "desde" con `Intl` en el servidor (sin riesgo de hidratación). */
function formatMemberSince(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Ficha pública del vendedor (PLAN §5.4). */
export function SellerCard({ seller }: { seller: ListingSeller }) {
  const since = formatMemberSince(seller.memberSince);

  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
      <Avatar size="lg">
        {seller.image ? (
          <AvatarImage src={seller.image} alt="" />
        ) : null}
        <AvatarFallback>{initials(seller.name)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-medium">
          <span className="truncate">{seller.name ?? "Vendedor"}</span>
          <BadgeCheck
            className="size-4 shrink-0 text-primary"
            aria-label="Vendedor verificado"
          />
        </p>
        {since ? (
          <p className="text-sm text-muted-foreground">
            En BiciMarket desde {since}
          </p>
        ) : null}
      </div>
    </div>
  );
}
