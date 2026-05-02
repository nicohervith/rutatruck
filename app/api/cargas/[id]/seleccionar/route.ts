import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.role !== "EMPRESA") {
    return NextResponse.json({ error: "Solo empresas" }, { status: 403 });
  }

  const { id } = await params;
  const cargaId = parseInt(id);
  if (isNaN(cargaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: { postulacionId: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const carga = await db.carga.findUnique({
    where: { id: cargaId, empresaId: session.userId, estado: "ACTIVA" },
  });
  if (!carga) {
    return NextResponse.json({ error: "Carga no encontrada" }, { status: 404 });
  }

  const postulacion = await db.postulacion.findUnique({
    where: { id: body.postulacionId, cargaId, estado: "PENDIENTE" },
  });
  if (!postulacion) {
    return NextResponse.json(
      { error: "Postulación no encontrada" },
      { status: 404 },
    );
  }

  await db.$transaction([
    db.carga.update({
      where: { id: cargaId },
      data: {
        estado: "ASIGNADA",
        transportistaAsignadoId: postulacion.transportistaId,
      },
    }),
    db.postulacion.update({
      where: { id: body.postulacionId },
      data: { estado: "ACEPTADA" },
    }),
    db.postulacion.updateMany({
      where: { cargaId, id: { not: body.postulacionId }, estado: "PENDIENTE" },
      data: { estado: "RECHAZADA" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
