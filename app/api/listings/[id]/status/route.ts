import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { isSameOrigin } from "@/lib/http";
import { isListingOwner, markListingSold } from "@/lib/listings";
import { z } from "zod";

const bodySchema = z.object({
  status: z.literal("sold"),
});

export async function PATCH(
  request: NextRequest,
  context: unknown,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ctx = context as { params: Promise<{ id: string }> };
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Id inválido" }, { status: 400 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const owner = await isListingOwner(id, session.user.id);
  if (!owner) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    await markListingSold(id, session.user.id);
    return NextResponse.json({ ok: true, status: "sold" });
  } catch (error) {
    console.error("PATCH /api/listings/[id]/status error:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el estado" },
      { status: 500 },
    );
  }
}
