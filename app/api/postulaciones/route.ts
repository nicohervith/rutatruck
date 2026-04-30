import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.role !== "TRANSPORTISTA") {
    return NextResponse.json({ error: "Solo transportistas pueden postularse" }, { status: 403 });
  }

  let body: { cargaId: number; mensaje?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.cargaId) {
    return NextResponse.json({ error: "Falta cargaId" }, { status: 400 });
  }

  const carga = await db.carga.findUnique({
    where: { id: body.cargaId, estado: "ACTIVA" },
  });

  if (!carga) {
    return NextResponse.json({ error: "Carga no encontrada o no disponible" }, { status: 404 });
  }

  try {
    const postulacion = await db.postulacion.create({
      data: {
        cargaId: body.cargaId,
        transportistaId: session.userId,
        mensaje: body.mensaje ?? null,
      },
    });
    return NextResponse.json({ id: postulacion.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya te postulaste a esta carga" }, { status: 409 });
  }
}
