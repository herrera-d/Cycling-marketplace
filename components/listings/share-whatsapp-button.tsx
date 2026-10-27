"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ShareWhatsAppButtonProps = {
  title: string;
  price: string;
  url: string;
};

export function ShareWhatsAppButton({
  title,
  price,
  url,
}: ShareWhatsAppButtonProps) {
  function handleShare() {
    const shareText = `${title} — ${price}\n${url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    
    try {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("[whatsapp-share] Error al abrir WhatsApp", error);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleShare}
      variant="outline"
      size="lg"
      className="rounded-full"
      aria-label="Compartir por WhatsApp"
    >
      <MessageCircle aria-hidden="true" />
      Compartir
    </Button>
  );
}
