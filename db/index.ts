import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

type Database = NeonHttpDatabase<typeof schema>;

let cached: Database | null = null;

/**
 * Cliente Drizzle sobre el driver HTTP serverless de Neon.
 *
 * Se inicializa de forma perezosa (lazy) para que importar el módulo no falle
 * si `DATABASE_URL` todavía no está definida (por ejemplo durante el build).
 */
export function getDb(): Database {
  if (!cached) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "Falta la variable de entorno DATABASE_URL. Copia .env.example a .env.local y complétala.",
      );
    }
    cached = drizzle(neon(connectionString), { schema });
  }
  return cached;
}

export { schema };
export * from "./schema";
