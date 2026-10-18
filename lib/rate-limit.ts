/**
 * Limitador de tasa en memoria (ventana deslizante).
 *
 * La Fase 5 necesita frenar el abuso en la creación de anuncios y en la subida
 * de imágenes (PLAN §9.1). Esta implementación vive en el proceso: es suficiente
 * en desarrollo y en una única instancia, pero **no** es distribuida. La Fase 8
 * la reemplaza por Upstash Redis (ya previsto en el stack), que sobrevive a los
 * despliegues serverless y comparte estado entre instancias.
 */

const buckets = new Map<string, number[]>();

/** Tope de claves para que el `Map` no crezca sin control. */
const MAX_KEYS = 5_000;

export type RateLimitResult = {
  ok: boolean;
  /** Peticiones restantes en la ventana actual. */
  remaining: number;
  /** Milisegundos hasta que se libere un hueco (0 si `ok`). */
  retryAfterMs: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const hits = (buckets.get(key) ?? []).filter((time) => time > windowStart);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    const oldest = hits[0] ?? now;
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: Math.max(oldest + windowMs - now, 0),
    };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Poda oportunista: evita que claves inactivas se acumulen para siempre.
  if (buckets.size > MAX_KEYS) {
    for (const [bucketKey, times] of buckets) {
      if (times.every((time) => time <= windowStart)) {
        buckets.delete(bucketKey);
      }
    }
  }

  return { ok: true, remaining: limit - hits.length, retryAfterMs: 0 };
}

/** Cabeceras estándar para una respuesta 429. */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "Retry-After": String(Math.max(Math.ceil(result.retryAfterMs / 1000), 1)),
  };
}
