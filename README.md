# BiciMarket — Marketplace de ciclismo 🚴

Marketplace de artículos de ciclismo de segunda mano. Next.js 15+ (App Router), TypeScript, Tailwind CSS v4 + shadcn/ui. Desplegable en Vercel con stack 100 % gratuito/open source (Neon + Drizzle, Auth.js, Supabase Storage).

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **UI:** Tailwind CSS v4 + shadcn/ui (design tokens en `app/globals.css`)
- **BD:** Neon (PostgreSQL) + Drizzle ORM *(Fase 1)*
- **Auth:** Auth.js / NextAuth con Google *(Fase 2)*
- **Storage:** Supabase Storage *(Fase 5)*
- **Data fetching:** TanStack Query *(Fase 3)*

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Configuración

Copia `.env.example` a `.env.local` y rellena las variables (ver fechas por fase en `PLAN.md`).

## Plan y workflow agentico

- Plan detallado, criterios de aceptación (DoD) por fase y sistema de diseño: [`PLAN.md`](./PLAN.md).
- Progreso de fases: [`docs/progress.md`](./docs/progress.md).
- Equipo de agentes en `.opencode/agents/` (orchestrator, frontend-dev, ui-designer, security-auditor, requirements-validator).