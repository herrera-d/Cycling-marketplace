# Plan de implementación — Marketplace de Ciclismo 🚴

> **Fecha:** Octubre 2026 · **Versión:** 1.0 (MVP)
>
> Aplicación web marketplace de artículos de ciclismo de segunda mano, desplegable en **Vercel** usando exclusivamente tecnologías **open source o con tier gratuito**. UI moderna y cuidada, a nivel **Airbnb**.

---

## 1. Visión general

Un marketplace donde cualquier persona puede **navegar y ver artículos de ciclismo a la venta sin cuenta**, y los usuarios registrados (vía **login con Google**) pueden **publicar sus propios artículos**, guardar favoritos y gestionar sus publicaciones.

### Features del MVP

- 🔐 Login con Google (`Auth.js`).
- 📋 Feed de artículos en venta con **infinite scroll**.
- 🎛️ Filtros por categoría, precio, condición, ubicación, texto y orden.
- 🛒 Público en lectura (feed + detalle) sin necesidad de cuenta.
- 📤 Publicación de artículos (solo con sesión iniciada) con múltiples imágenes.
- ❤️ Favoritos para usuarios registrados.
- 🗂️ Gestión de mis publicaciones (editar, marcar vendido, eliminar).

### Fuera de alcance del MVP (futuro)

- Mensajería / chat entre comprador y vendedor.
- Pagos, envíos y reseñas.
- Reportes y moderación avanzada.

---

## 2. Stack tecnológico (100 % open source / free tier)

| Capa | Tecnología | Costo |
|------|-----------|-------|
| Framework | **Next.js 15 (App Router) + TypeScript** | Gratis / open source |
| UI | **Tailwind CSS + shadcn/ui** (Radix Primitives) | Gratis / open source |
| Auth | **Auth.js (NextAuth v5)** con Google OAuth + adaptador Drizzle | Gratis / open source |
| Base de datos | **PostgreSQL en Neon** (serverless, free tier) | Gratis |
| ORM | **Drizzle ORM** + drizzle-kit (migraciones) | Gratis / open source |
| Imágenes | **Supabase Storage** (bucket público `listings`) | Free tier |
| Data fetching | **TanStack Query v5** (`useInfiniteQuery`) | Gratis / open source |
| Formularios / validación | **React Hook Form + Zod** | Gratis / open source |
| Rate limiting | **Upstash Redis** (free tier) | Gratis |
| Deploy | **Vercel** (plan Hobby) | Gratis |

> Todos los servicios cuentan con tier gratuito suficiente para un MVP en producción.

---

## 3. Arquitectura

```
Usuario → Vercel (Next.js)
              ├── Server Components → primera página del feed renderizada en servidor (SEO)
              ├── API Routes (/api/*)  → paginación por cursor, filtros, mutaciones
              ├── Auth.js              → Google OAuth, sesiones JWT
              ├── Drizzle ORM          → Neon (PostgreSQL serverless)
              └── Supabase Storage     → imágenes de los listings
```

### Principios

- **Server Components por defecto**; solo el mínimo de componentes client.
- **Infinite scroll** con cursor pagination (más eficiente y estable que offset).
- **Filtros sincronizados con la URL** (`?categoria=...&min=...&q=...`) → enlaces compartibles, retroceso del navegador y SSR inicial.
- **Protección por capability**: las rutas de escritura (`/sell`, `/mis-articulos`, `/favoritos`, endpoints POST/DELETE) validan la sesión. Las rutas de lectura son públicas.

---

## 4. Modelo de datos (Drizzle)

```sql
users            (id, name, email, image, createdAt)
categories       (id, name, slug, icon)               -- seed: Bicicletas, Componentes, Ruedas,
                                                      -- Ropa, Calzado, Cascos, Accesorios,
                                                      -- Entrenamiento, Herramientas
listings         (id, title, description, priceCents, currency,
                  categoryId, condition, brand, size, location,
                  status: draft | active | sold,
                  sellerId, createdAt, updatedAt)
listing_images   (id, listingId, url, position)
favorites        (userId, listingId, createdAt)       -- PK compuesta (userId, listingId)
```

**Índices de rendimiento**

- `listings (status, createdAt)` → feed ordenado por recientes.
- `listings (categoryId, status)` → filtro por categoría.
- `favorites (userId)` → lista de favoritos.
- `pg_trgm` sobre `listings.title` → búsqueda de texto.

**Condiciones del artículo:** `new | like_new | good | fair`.

**Notas**

- Precio siempre en centavos (`priceCents`) para evitar errores de redondeo; `currency` por defecto `EUR`/`MXN`/`USD` (a decidir).
- `status` permite borrador, activo y vendido.
- La subida de imágenes es independiente del insert del listing (se crea el listing con `status: draft` y luego se completa).

---

## 5. Detalle de cada feature

### 5.1 Login con Google
- Auth.js con provider de Google (credenciales en Google Cloud Console, gratis).
- Adaptador Drizzle para persistir usuarios en Neon.
- Navbar reactiva: avatar + nombre si hay sesión, botón "Iniciar sesión" si no.

### 5.2 Feed con infinite scroll
- `GET /api/listings?cursor=...&categoria=...&min=...&max=...&condicion=...&ubi=...&orden=...&q=...`
- Respuesta: `{ items: Listing[], nextCursor: string | null }`.
- Primera página: Server Component (SEO + sin parpadeo). Siguientes páginas: `useInfiniteQuery` + `IntersectionObserver` sobre un elemento sentinel.

### 5.3 Filtros
- Categoría (select multi o single), rango de precio, condición, ubicación (texto), texto de búsqueda y orden (recientes, precio ↑, precio ↓).
- Estado en URL via `useSearchParams` + `router.replace` (sin recargar).

### 5.4 Detalle del artículo
- Ruta pública `/listings/[id]`.
- Galería grande + miniaturas, título, precio destacado, descripción, datos del vendedor, badges (condición, categoría, ubicación) y botón de favorito.

### 5.5 Publicar artículos (requiere sesión)
- `/sell` protegida (middleware + verificación en el endpoint).
- Formulario multi-step (Zod + React Hook Form): título, descripción, precio, moneda, categoría, condición, marca, talla, ubicación.
- Subida multi-imagen a **Supabase Storage** con previsualización, validación de tipo/tamaño y orden.
- `POST /api/listings` valida sesión y datos antes de insertar.

### 5.6 Favoritos
- Botón corazón en cards y detalle; `POST/DELETE /api/favorites/:listingId`.
- Página `/favoritos` (protegida) con los artículos guardados.

### 5.7 Gestión de mis publicaciones
- `/mis-articulos` (protegida): listado de mis artículos con acciones:
  - Editar (reutiliza el formulario de publicación con datos precargados).
  - Marcar como vendido.
  - Eliminar (solo el autor; borra también sus imágenes).

---

## 6. Diseño de UI / UX (nivel Airbnb) 🎨

**Requisito clave:** la interfaz debe sentirse **moderna, premium y cuidada en cada detalle**, tomando como referencia productos como Airbnb, Stripe o Linear.

### 6.1 Sistema de diseño (tokens)

| Token | Valor |
|-------|-------|
| Escala de espaciado | 4, 8, 12, 16, 24, 32, 48, 64, 96 px |
| Radios | sm 8 · md 12 · lg 16 · xl 24 px (cards y fotos generosas) |
| Sombras | suaves, difuminadas, elevación sutil (`shadow-sm` → `shadow-xl`) |
| Tipografía | Inter; escala 12/14/16/18/24/32/40; pesos 400/500/600/700 |
| Color | paleta neutra cálida/fría + 1 acento de marca; modo claro y oscuro |
| Bordes | `border` 1px del color separador en lugar de sombras fuertes |

### 6.2 Componentes clave

- **Cards del feed:** imagen protagonista ratio 4:3, `rounded-2xl`, hover con *lift* + leve zoom de imagen; precio destacado en negrita, badge de condición, corazón de favorito.
- **Skeletons:** loaders de shimmer mientras cargan imágenes y cards (evita saltos de layout).
- **Header sticky:** logo, buscador, filtro y botón "Publicar" con color de marca de alto contraste.
- **Filtros:** sidebar en desktop; *sheet/bottom-sheet* en móvil; aplicados sin recargar.
- **Detalle:** galería grande con miniaturas; layout 2 columnas (imagen izq. / info der.) en desktop; CTA claro.
- **Micro-interacciones:** transiciones 150–200 ms `ease-out`, hover states, toasts de feedback (guardado, error, etc.).

### 6.3 Responsive (mobile-first)

- Breakpoints: 640 / 768 / 1024 / 1280 px.
- Grid del feed: **4 columnas** desktop → **3** tablet → **2** móvil.
- Navegación: header compacto en móvil; barra inferior (Inicio, Publicar, Favoritos, Perfil) opcional en móvil.
- Targets táctiles ≥ 44 px; sin hover-only para acciones críticas en táctil.

### 6.4 Accesibilidad

- Contraste **WCAG AA** en texto e iconos.
- Estados de foco visibles; `aria-label` en botones de icono.
- `prefers-reduced-motion` respetado.
- Upload de imágenes con feedback por estado (cargando / error).

---

## 7. Equipo de agentes (definidos en `.opencode/agents/`)

El proyecto cuenta con agentes especializados para mantener la calidad en cada área:

| Agente | Rol | Uso |
|--------|-----|-----|
| `frontend-dev` | Experto en desarrollo frontend (Next.js, React, TS, performance) | Implementación de componentes y páginas |
| `ui-designer` | Experto en diseño UI y responsive (nivel Airbnb) | Diseño del sistema, revisión visual, responsividad |
| `security-auditor` | Experto en seguridad que audita el proyecto | Auditorías por fases (solo lectura) |

Flujo sugerido:

1. `frontend-dev` implementa cada feature (Fases 3–8).
2. `ui-designer` hace *design review* de las pantallas y componentes.
3. `security-auditor` audita al cerrar cada milestone (auth, API, uploads, secretos).

---

## 8. Estructura del proyecto

```
app/
  layout.tsx                    # root layout + header/footer
  page.tsx                      # feed público
  listings/[id]/page.tsx        # detalle
  sell/page.tsx                 # protegida
  mis-articulos/page.tsx        # protegida
  favoritos/page.tsx            # protegida
  login/page.tsx
  api/
    auth/[...nextauth]/route.ts
    listings/route.ts           # GET paginado/filtros + POST
    listings/[id]/route.ts      # PATCH/DELETE
    favorites/[listingId]/route.ts
    upload/route.ts
db/
  schema.ts · index.ts · seed.ts
components/
  listings/{listing-card,infinite-feed,filters,upload-images}.tsx
  ui/                           # shadcn (Customizable)
lib/
  auth.ts · validations.ts · storage.ts · rate-limit.ts · format.ts
styles/
  globals.css                   # design tokens
middleware.ts
.env.example
PLAN.md
.opencode/agents/*.md
```

---

## 9. Roadmap por fases

| Fase | Entregable | Estimación |
|------|-----------|-----------|
| **0. Setup** | Repo, Next.js + Tailwind + shadcn, **design system inicial**, deploy vacío en Vercel | 0.5 día |
| **1. Base de datos** | Neon + Drizzle, schema, migraciones, seed de categorías | 1 día |
| **2. Auth** | Google OAuth, adaptador, navbar con sesión | 1 día |
| **3. Feed + filtros + infinite scroll** | API paginada, filtros URL, skeleton loaders, cards premium | 2–3 días |
| **4. Detalle** | Galería, precio destacado, datos del vendedor | 1 día |
| **5. Publicar** | Formulario multi-step, subida a Supabase, ruta protegida | 2 días |
| **6. Favoritos** | Toggle en cards/detalle + página `/favoritos` | 0.5 día |
| **7. Gestión propia** | Editar / vender / eliminar en `/mis-articulos` | 1 día |
| **8. Pulido + audit** | SEO, accesibilidad, rate limiting, **design review** y **auditoría de seguridad** | 2 días |
| **9. Deploy final** | Dominio, variables de entorno, monitoreo, analítica | 0.5 día |

**Total aproximado: 11–14 días.**

---

### 9.1 Criterios de aceptación (DoD) por fase

> El agente `requirements-validator` usa estos checklists como criterio objetivo para dar **PASS/FAIL** a cada fase. El `orchestrator` no avanza de fase sin PASS.

#### Fase 0 — Setup
- [ ] Proyecto Next.js 15 (App Router) + TypeScript corriendo en local.
- [ ] Tailwind + shadcn/ui configurados con design tokens (sección 6) en `styles/globals.css`.
- [ ] Repo git inicializado (branch `main`).
- [ ] Deploy base funcionando en Vercel (`*.vercel.app`).
- [ ] `npm run dev`, `npm run build` y `npm run lint` sin errores.

#### Fase 1 — Base de datos
- [ ] Esquema Drizzle completo: `users`, `categories`, `listings`, `listing_images`, `favorites`.
- [ ] Migraciones aplicadas en Neon (dev y prod).
- [ ] Seed de categorías ejecutado y verificable.
- [ ] `.env.example` con todas las variables documentadas.
- [ ] Índices: `(status, createdAt)`, `(categoryId, status)`, `favorites(userId)`, `pg_trgm(title)`.

#### Fase 2 — Auth
- [ ] Google OAuth configurado en Google Cloud Console.
- [ ] Auth.js con adaptador Drizzle; sesiones funcionales.
- [ ] Navbar: avatar + nombre con sesión; "Iniciar sesión" sin ella.
- [ ] Post-login vuelve a la ruta original.
- [ ] Rutas protegidas por middleware; sin sesión → redirección a `/login`.

#### Fase 3 — Feed + filtros + infinite scroll
- [ ] `GET /api/listings` devuelve `{ items, nextCursor }` (cursor pagination).
- [ ] Filtros (categoría, precio, condición, orden, texto, ubicación) en la query SQL.
- [ ] Filtros sincronizados con la URL; botón back del navegador funciona.
- [ ] Infinite scroll sin duplicados, con skeleton loaders y sentinel.
- [ ] Primera página renderizada en servidor con metadata SEO.
- [ ] Empty state y error state diseñados.

#### Fase 4 — Detalle
- [ ] Ruta pública `/listings/[id]` con galería + miniaturas.
- [ ] Precio destacado, descripción, condición, categoría, ubicación y vendedor.
- [ ] CTA de favorito (con sesión) visible.
- [ ] Metadata dinámica (título, descripción, `og:image`).
- [ ] 404 manejado para ids inexistentes.

#### Fase 5 — Publicar
- [ ] `/sell` protegida; sin sesión → `/login`.
- [ ] Formulario Zod: título, descripción, precio, moneda, categoría, condición, marca, talla, ubicación.
- [ ] Upload multi-imagen a Supabase Storage con preview, validación de tipo/tamaño y orden.
- [ ] `POST /api/listings` valida sesión + datos; guarda listing e imágenes.
- [ ] El artículo aparece en el feed tras publicar.
- [ ] Rate limiting activo en creación y upload.

#### Fase 6 — Favoritos
- [ ] Toggle corazón en cards y detalle para sesiones activas.
- [ ] `POST/DELETE /api/favorites/:listingId` con verificación de sesión.
- [ ] Página `/favoritos` lista los guardados.
- [ ] Estado consistente entre feed y detalle.
- [ ] Sin sesión → al tocar favorito redirige a `/login`.

#### Fase 7 — Gestión propia
- [ ] `/mis-articulos` muestra solo artículos del usuario autenticado (ownership).
- [ ] Editar reutiliza el formulario con datos precargados; PATCH valida ownership.
- [ ] Marcar como vendido actualiza `status`.
- [ ] Eliminar borra listing + imágenes del storage; verifica ownership.
- [ ] Acciones con toast y confirmación en borrado.

#### Fase 8 — Pulido + audit
- [ ] Design review de `ui-designer`: estados vacío, carga, error y sin sesión.
- [ ] Auditoría de `security-auditor`: auth, API, uploads, secretos, rate limiting, dependencias.
- [ ] Validación total: todas las features del MVP cumpliendo sus DoD.
- [ ] Accesibilidad: contraste AA, focus states, `prefers-reduced-motion`.
- [ ] SEO global: metadata, sitemap, robots.txt, OG.
- [ ] `tsc`, lint y build sin errores; sin advertencias de consola.

#### Fase 9 — Deploy final
- [ ] Variables de entorno configuradas en Vercel (producción).
- [ ] Dominio con HTTPS activo.
- [ ] Monitoreo/analítica configurados.
- [ ] Smoke test manual end-to-end (login, feed, filtros, scroll, publicar, favoritos, mis-artículos).
- [ ] `PLAN.md` y `docs/progress.md` reflejan el estado final.

---

## 10. Variables de entorno (`.env` / Vercel)

```
DATABASE_URL                              # Neon (production: pooled URL)
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET   # Google Cloud Console
AUTH_SECRET                               # openssl rand -base64 32
NEXTAUTH_URL                              # URL de producción (o AUTH_URL)
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY                 # ¡nunca en cliente, solo servidor!
UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
```

---

## 11. Riesgos y consideraciones

- **Límites free tier:** Vercel (invocaciones y duración de funciones), Neon (storage 0.5 GB) y Supabase (1 GB). Servir imágenes siempre desde Supabase, nunca desde una función de Vercel.
- **Cold start de Neon:** mitigar con connection pooling y, si hace falta, queries optimizadas.
- **Seguridad:** nunca exponer `SUPABASE_SERVICE_ROLE_KEY` al cliente; validar `sellerId`/`userId` contra la sesión en cada endpoint; rate limiting en `POST /api/listings` y uploads (Upstash).
- **Abuso de imágenes:** validar tipo (jpeg/png/webp), tamaño y límites; nombres aleatorios en el bucket.
- **SEO:** feed y detalle en Server Components con metadata; `next/image` para optimización.

---

## 12. Decisiones abiertas / próximos pasos

- Moneda por defecto (EUR / MXN / USD) y formato de precios.
- Filtro de categoría simple o múltiple.
- Idioma: interfaz en **español** (confirmado).
- Nombre comercial de la app (la carpeta de trabajo es `cycling-marketplace`).