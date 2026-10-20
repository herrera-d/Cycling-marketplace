import type { NextConfig } from "next";

/**
 * Content-Security-Policy (deuda de Fase 8/9 cerrada en Fase 8).
 *
 * - `script-src 'unsafe-inline'`: Next.js inyecta el bootstrap y los payloads
 *   RSC como `<script>` inline; el build de producción no usa `eval`.
 * - `img-src`/`connect-src` limitados a los orígenes reales: Supabase Storage,
 *   el CDN de demo (Unsplash) y los avatares de Google. El OAuth de Google es
 *   una navegación de nivel superior, no una petición del navegador.
 * - `form-action` incluye `accounts.google.com`: Chrome aplica `form-action`
 *   a toda la cadena de redirects del POST nativo del botón de login (path
 *   sin JS o pre-hidratación), que termina en el authorize de Google. Sin ese
 *   origen, ese path quedaba bloqueado con un error engañoso que citaba
 *   `/login`. El path normal (con JS) usa fetch + navegación de cliente y no
 *   está sujeto a `form-action`.
 * - Solo se emite en builds de producción: en `next dev` las herramientas de
 *   desarrollo necesitan `eval`/websockets y romperían el DX.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** Cabeceras de seguridad aplicadas a todas las respuestas. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: csp }]
    : []),
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Imágenes subidas por los usuarios a Supabase Storage (bucket público).
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
