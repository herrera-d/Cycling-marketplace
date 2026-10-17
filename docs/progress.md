# Progreso del plan — Marketplace de Ciclismo

Estado por fases gestionado por el agente `orchestrator` tras cada iteración de validación.

**Estados:** `⬜ Pendiente` · `⏳ En curso` · `🔁 En revisión` · `✅ Completado` · `❌ Bloqueado`

| Fase | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| 0 | Setup: repo, Next.js, Tailwind, shadcn, design system, deploy Vercel | ✅ Completado | Deploy temporal expiró · deploy permanente en Fase 9 |
| 1 | Base de datos: Neon + Drizzle, schema, migraciones, seed | ✅ Completado | Neon PG 17.11 · 5 tablas · seed 9 categorías |
| 2 | Auth: Google OAuth, adaptador, navbar | ✅ Completado | Auth.js v5 + Drizzle · JWT · `proxy.ts` (Next 16 renombró middleware) |
| 3 | Feed + filtros + infinite scroll | ⬜ Pendiente | — |
| 4 | Detalle del artículo | ⬜ Pendiente | — |
| 5 | Publicar artículos + Supabase Storage | ⬜ Pendiente | — |
| 6 | Favoritos | ⬜ Pendiente | — |
| 7 | Gestión de mis publicaciones | ⬜ Pendiente | — |
| 8 | Pulido + design review + auditoría de seguridad | ⬜ Pendiente | — |
| 9 | Deploy final: dominio, env vars, monitoreo | ⬜ Pendiente | — |

## Bitácora

| Fecha | Fase | Resultado | Iteración | Resumen |
|-------|------|-----------|-----------|---------|
| 2026-10-10 | 0 | PASS | 1/3 | Next.js 16.4 + TS + Tailwind v4 + shadcn (base-nova). Tokens de diseño según sección 6 (Inter, radios 8–48, sombras card/lifted, acento verde). Landing placeholder mostrando el sistema. lint/build/tsc OK. Smoke test HTTP 200 local y en Vercel (temporary-speedy-poplar-wgoxfrt.vercel.app, código 47fe0840. Expira en 60 min: reclamar con `vercel login`). Deuda: deploy permanente real en Fase 9; `npm audit` reporta 9 high (deps de build, revisar en Fase 8). |
| 2026-10-15 | 1 | PASS | 1/3 | Neon (PostgreSQL 17.11, `sa-east-1`, pooled) + Drizzle ORM. Esquema: `users`, `categories`, `listings`, `listing_images`, `favorites` + enums `listing_condition`/`listing_status`. Índices verificados: `(status,created_at)`, `(category_id,status)`, `favorites(user_id)`, GIN `pg_trgm(title)` con extensión `pg_trgm` activa. Migración `0000` aplicada (1 registrada) y seed idempotente de 9 categorías. Cliente `getDb()` (driver HTTP serverless) validado con consultas tipadas. Deuda: migrar también la BD de producción en Fase 9. `.env.example` documenta todas las variables por fase. |

| 2026-10-16 | 2 | PASS | 1/3 | Google OAuth (proyecto GCP `BiciMarket`, client "BiciMarket Web", redirect `http://localhost:3000/api/auth/callback/google`). **Auth.js v5** (`next-auth@5.0.0-beta.32`) + `@auth/drizzle-adapter@1.11.3`; estrategia **JWT** (el adaptador persiste `users`/`accounts`, sin tabla `sessions` en uso). Nuevas tablas `accounts`, `sessions`, `verification_tokens` (migración `0001` aplicada). Config en `lib/auth.ts`, handlers en `app/api/auth/[...nextauth]/route.ts`, DAL en `lib/dal.ts` (`getSession`/`verifySession`/`getOptionalUser`). Rutas protegidas vía **`proxy.ts`** (Next 16 deprecó `middleware.ts`): `/sell`, `/mis-articulos`, `/favoritos` → 307 a `/login?callbackUrl=…`. Navbar muestra avatar + nombre con sesión y "Iniciar sesión" sin ella; menú con Mis artículos / Favoritos / Cerrar sesión. **Desviación del plan §8**: `middleware.ts` → `proxy.ts` (cambio de Next 16). **Aprendizaje `cacheComponents`**: leer la sesión fuera de `<Suspense>` es error de build; además `auth()` dispara `crypto.getRandomValues()` durante el prerender → se centralizó `await connection()` en el DAL. Verificado end-to-end en Chrome dedicado: login Google, usuario+cuenta en Neon (`deherrera@gmail.com`), session 0 filas (JWT OK), `/sell` protegida, retorno a ruta original, y logout. build + lint + tsc OK, consola limpia. |
| 2026-10-16 | 2 | PASS | 1/3 (auditoría) | **security-auditor → APROBADO CON OBSERVACIONES** (0 críticas/altas explotables) y **requirements-validator → PASS-CON-DEUDAS** (ningún ❌). Correcciones aplicadas en la misma iteración: **M-1** open redirect en `/login` (bypass `/\evil.com`) → `safeCallbackUrl` ahora resuelve contra un origen dummy y compara `origin` (verificado: `/%5Cevil.com`, `//evil.com` y `https://evil.com` → `/`; `/sell` OK); **M-2** retirado `trustHost: true` fijo (se activa solo con `AUTH_URL`/Vercel; login re-verificado OK); **M-3** rutas protegidas centralizadas en `lib/routes.ts` (`isProtectedPath`); **B-2** `shadcn` movido a `devDependencies`; **B-5** matcher `api/` con frontera. Cabeceras de seguridad añadidas en `next.config.ts` (nosniff, X-Frame-Options DENY, Referrer-Policy, HSTS, Permissions-Policy). Deudas diferidas a fases siguientes: CSP + `prefers-reduced-motion` (Fase 8), nombre oculto en móvil, `npm audit` (9 high en devDeps/CLI), `AUTH_URL` https obligatoria en producción (Fase 9). |

<!-- El orquestador registra aquí el resultado de cada iteración:
Fecha · Fase · Resultado (PASS/FAIL) · Iteración n/3 · Resumen -->