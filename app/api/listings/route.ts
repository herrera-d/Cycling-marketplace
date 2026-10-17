import { connection } from "next/server";
import { NextResponse } from "next/server";

import { getListingsPage } from "@/lib/listings";
import { listingQuerySchema } from "@/lib/validations";

/**
 * GET /api/listings — feed público paginado por cursor.
 *
 * Contrato (PLAN §5.2): `{ items, nextCursor, total }`.
 * Params: `cursor, categoria, q, min, max, condicion, ubi, orden, limit`.
 */
export async function GET(request: Request) {
  // La ruta es dinámica (datos en vivo): sin esto Next la prerenderizaría.
  await connection();

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = listingQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parámetros inválidos", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const page = await getListingsPage(parsed.data);
    return NextResponse.json(page, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("GET /api/listings failed", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los anuncios" },
      { status: 500 },
    );
  }
}
