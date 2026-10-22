import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, Geist_Mono, Space_Grotesk } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/**
 * Grotesca de display para los títulos.
 *
 * `Space Grotesk` aporta un gesto geométrico con personality (cifras con
 * corte, terminals rectas) que hace que los titulares se lean "diseñados"
 * en vez de "por defecto", sin renunciar a la legibilidad de Inter en el
 * cuerpo de texto.
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.AUTH_URL ||
      "http://localhost:3000",
  ),
  title: {
    default: "BiciMarket — Marketplace de ciclismo",
    template: "%s · BiciMarket",
  },
  description:
    "Compra y vende bicicletas, componentes y equipo de ciclismo de segunda mano.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "BiciMarket",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
      /* `next-themes` escribe la clase `dark` en `<html>` antes del pintado
          (script inline en el head), así que el servidor no puede saberla:
          `suppressHydrationWarning` evita el mismatch de hidratación sin
          propagar la supresión al resto del árbol. */
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        {/* Analítica y Core Web Vitals de Vercel (PLAN §9.1 Fase 9): ambos
            servicios son gratuitos en el plan Hobby y no envían datos si no se
            habilitan en el proyecto. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}