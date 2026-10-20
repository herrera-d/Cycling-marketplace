import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";
import { isSameOrigin } from "@/lib/http";
import {
  deleteListing,
  isListingOwner,
  updateListing,
} from "@/lib/listings";
import { listingFormSchema } from "@/lib/validations";
import { deleteListingImagesByUrls } from "@/lib/storage";

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
  const parsed = listingFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const owner = await isListingOwner(id, session.user.id);
  if (!owner) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    await updateListing(id, parsed.data, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/listings/[id] error:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el anuncio" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

  const owner = await isListingOwner(id, session.user.id);
  if (!owner) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const urls = await deleteListing(id, session.user.id);
    await deleteListingImagesByUrls(urls);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/listings/[id] error:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el anuncio" },
      { status: 500 },
    );
  }
}
