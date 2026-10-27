# Compartir por WhatsApp

## Descripción
Se agregó un botón "Compartir" junto al botón de favoritos en la ficha de detalle de un anuncio. Al hacer clic, abre WhatsApp Web/App con un texto preformateado (`Título — Precio` + URL).

## Componente
- `components/listings/share-whatsapp-button.tsx`: Componente cliente que construye `https://wa.me/?text=...` con `encodeURIComponent` y usa `window.open` con `noopener,noreferrer`.

## Ubicación
- `app/listings/[id]/page.tsx`: Se renderiza junto a `FavoriteSection` y el botón "Ver más de...".

## Open Graph / Miniatura
- `app/listings/[id]/page.tsx` (generateMetadata): Se usa el optimizador de Next (`/_next/image?url=...&w=1200&q=75`) para reducir el tamaño de la imagen OG sin duplicar archivos en Supabase.
- Se añaden `og:image:width=1200`, `og:image:height=630`, `og:image:type=image/jpeg`, `og:image:alt`, y `twitter:image`.
- Si no hay portada o falla la construcción de la URL, se usa la imagen original como fallback.
- Logs con prefijo `[og:image]` para debuggear en caso de alcanzar límites de Vercel Image Optimization.

## Tests
- `tests/share-whatsapp.test.tsx`: Verifica renderizado y construcción correcta de la URL de WhatsApp.

## Comportamiento
- La miniatura la genera WhatsApp a partir de las tags OG. Si la imagen es muy pesada (>~300-600KB), puede que no aparezca; con el optimizador se reduce drásticamente.
- Cache de WhatsApp: puede tardar en actualizar al cambiar portada/OG.
