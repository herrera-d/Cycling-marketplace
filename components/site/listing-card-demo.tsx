import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ListingCardDemoProps = {
  title: string;
  price: string;
  condition: string;
  emoji: string;
};

/**
 * Card demo (design system showcase). Se sustituirá por listing-card real
 * en la Fase 3 (feed).
 */
export function ListingCardDemo({
  title,
  price,
  condition,
  emoji,
}: ListingCardDemoProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl shadow-card transition-shadow duration-200 hover:shadow-lifted">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-teal-50 to-neutral-100">
        <span
          className="absolute inset-0 grid place-items-center text-6xl transition-transform duration-300 group-hover:scale-110"
          role="img"
          aria-label={title}
        >
          {emoji}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className="rounded-full font-medium"
          >
            {condition}
          </Badge>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-lg font-bold tracking-tight">{price}</p>
      </div>
    </Card>
  );
}