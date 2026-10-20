import { sql } from "drizzle-orm";

import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";

/**
 * Limitador de tasa por ventana, con el contador en la propia base de datos.
 *
 * PLAN §9.1 (Fase 8) y §11: los límites tienen que valer en **todas** las
 * instancias serverless, no solo en el proceso que atiende la petición. Usar
 * Neon evita sumar un servicio externo (el stack es 100 % gratuito) y vale para
 * local, staging y producción con el mismo código.
 *
 * Estrategia: ventana fija por clave. El `upsert` atómico incrementa el
 * contador y, si la ventana venció, la reinicia en la misma sentencia — así dos
 * instancias concurrentes nunca leen un contador viejo.
 *
 * Si la consulta falla se **permite** la petición (fail-open): un limitador
 * roto no debe tumbar publicaciones ni subidas.
 */

/** Ventana de retención de claves podadas. */
const PRUNE_RETENTION_DAYS = 1;
/** Probabilidad de podar claves vencidas en cada ventana nueva. */
const PRUNE_PROBABILITY = 0.02;

export type RateLimitResult = {
  ok: boolean;
  /** Peticiones restantes en la ventana actual. */
  remaining: number;
  /** Milisegundos hasta que se libere un hueco (0 si `ok`). */
  retryAfterMs: number;
};

export async function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  try {
    const db = getDb();
    const expired = sql`${rateLimits.windowStartedAt} <= now() - make_interval(secs => ${windowMs}::double precision / 1000.0)`;

    const [row] = await db
      .insert(rateLimits)
      .values({ key, count: 1 })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
          windowStartedAt: sql`case when ${expired} then now() else ${rateLimits.windowStartedAt} end`,
        },
      })
      .returning({
        count: rateLimits.count,
        windowStartedAt: rateLimits.windowStartedAt,
      });

    const retryAfterMs = Math.max(
      row.windowStartedAt.getTime() + windowMs - Date.now(),
      0,
    );

    if (row.count > limit) {
      return { ok: false, remaining: 0, retryAfterMs };
    }

    // Poda oportunista: las claves de ventanas viejas no se usan nunca más.
    if (row.count === 1 && Math.random() < PRUNE_PROBABILITY) {
      try {
        await db
          .delete(rateLimits)
          .where(
            sql`${rateLimits.windowStartedAt} < now() - make_interval(days => ${PRUNE_RETENTION_DAYS}::int)`,
          );
      } catch {
        // La poda es secundario: no condiciona la respuesta.
      }
    }

    return { ok: true, remaining: limit - row.count, retryAfterMs: 0 };
  } catch (error) {
    console.error(`rateLimit(${key}) no respondió; se permite la petición`, error);
    return { ok: true, remaining: limit, retryAfterMs: 0 };
  }
}

/** Cabeceras estándar para una respuesta 429. */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "Retry-After": String(Math.max(Math.ceil(result.retryAfterMs / 1000), 1)),
    "X-RateLimit-Remaining": String(result.remaining),
  };
}
