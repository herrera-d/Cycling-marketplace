# BiciMarket — Marketplace de ciclismo 🚴

Marketplace de artículos de ciclismo de segunda mano: feed con búsqueda, filtros e infinite scroll, publicación con subida de imágenes, favoritos y gestión de anuncios. Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui, con stack **100 % gratuito/open source**: Neon (Postgres) + Drizzle, Auth.js (Google), Supabase Storage y Vercel.

**Producción:** https://cycling-marketplace.vercel.app (vacía de contenido)
**Staging:** https://cycling-marketplace-staging.vercel.app (datos demo para pruebas end-to-end)

## Features

- **Feed**: búsqueda, filtros (categoría, condición, precio, ubicación, orden) e infinite scroll con cursor keyset; primera página renderizada en servidor.
- **Detalle**: galería con miniaturas y teclado, metadata dinámica, 404 real y favoritos optimistas.
- **Publicar**: formulario en 3 pasos con hasta 8 imágenes a Supabase Storage (validación tipo/tamaño, ownership check y compensación en fallos).
- **Gestión propia**: editar, marcar vendido y eliminar (con limpieza de Storage).
- **Favoritos**: toggle en tarjetas y detalle + página `/favoritos`.
- **Accesibilidad**: contraste AA verificado por script, focus states y `prefers-reduced-motion`.
- **SEO**: metadata, sitemap, robots, 404 propio y OG image generada en servidor.
- **Seguridad**: Auth.js (Google, JWT + DAL), chequeo de propiedad, origin guard, validación Zod, CSP, cabeceras de seguridad y rate limiting en Neon.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **UI:** Tailwind CSS v4 + shadcn/ui (tokens en `app/globals.css`)
- **BD:** Neon (PostgreSQL) + Drizzle ORM
- **Auth:** Auth.js / NextAuth v5 con Google
- **Storage:** Supabase Storage
- **Data fetching:** TanStack Query
- **Deploy:** Vercel (proyecto de producción + proyecto de staging)

## Desarrollo

```bash
npm install
cp .env.example .env.local   # rellena las variables (ver comentarios del propio archivo)
npm run dev                  # http://localhost:3000
npm run lint
npm run build
npm run check:contrast       # verifica contraste AA de los design tokens
```

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run db:generate` / `npm run db:migrate` | Migraciones de Drizzle (dev) |
| `npm run db:migrate:staging` / `npm run db:migrate:prod` | Migraciones por ambiente |
| `npm run db:seed` / `npm run db:seed:demo` / `npm run db:seed:staging` | Seed completo, solo demo o staging |
| `npm run db:seed:prod` | Solo categorías en producción (sin datos demo) |
| `npm run db:status` | Muestra a qué base apunta cada ambiente |
| `npm run db:clean:prod` | Vacía producción (doble confirmación) |
| `npm run deploy:staging` / `npm run deploy:prod` | Deploy a Vercel |

## Documentación

- Plan, criterios de aceptación (DoD) por fase y sistema de diseño: [`PLAN.md`](./PLAN.md).
- Bitácora de progreso y deudas aceptadas: [`docs/progress.md`](./docs/progress.md).
- Equipo de agentes en `.opencode/agents/` (orchestrator, frontend-dev, ui-designer, security-auditor, requirements-validator).
