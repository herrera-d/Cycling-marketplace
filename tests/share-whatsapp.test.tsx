import { render, screen, fireEvent } from "@testing-library/react";
import { ShareWhatsAppButton } from "@/components/listings/share-whatsapp-button";

describe("ShareWhatsAppButton", () => {
  beforeEach(() => {
    // @ts-expect-error - mock
    delete window.open;
    window.open = jest.fn();
  });

  it("renderiza el botón con texto Compartir", () => {
    render(<ShareWhatsAppButton title="Bici Trek" price="$1000" url="https://example.com/listings/123" />);
    expect(screen.getByRole("button", { name: /compartir por whatsapp/i })).toBeInTheDocument();
  });

  it("abre WhatsApp con wa.me y el texto codificado", () => {
    render(<ShareWhatsAppButton title="Bici Trek" price="$1000" url="https://example.com/listings/123" />);
    fireEvent.click(screen.getByRole("button", { name: /compartir por whatsapp/i }));
    expect(window.open).toHaveBeenCalledTimes(1);
    const url = (window.open as jest.Mock).mock.calls[0][0];
    expect(url).toContain("https://wa.me/?text=");
    expect(url).toContain(encodeURIComponent("Bici Trek — $1000"));
    expect(url).toContain(encodeURIComponent("https://example.com/listings/123"));
  });
});
