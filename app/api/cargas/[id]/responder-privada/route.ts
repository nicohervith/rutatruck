import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isTransportista } from "@/lib/roles";
import { notifyEmpresa, notifyTransportista } from "@/lib/sse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || !isTransportista(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const cargaId = parseInt(id);
  if (isNaN(cargaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: { accion: "aceptar" | "rechazar" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const carga = await db.carga.findUnique({
    where: {
      id: cargaId,
      esPrivada: true,
      transportistaDestinadoId: session.userId,
      estado: "ACTIVA",
    },
  });
  if (!carga) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  if (body.accion === "rechazar") {
    await db.carga.update({ where: { id: cargaId }, data: { estado: "CANCELADA" } });
    notifyEmpresa(carga.empresaId).catch(() => {});
    notifyTransportista(session.userId).catch(() => {});
    return NextResponse.json({ ok: true });
  }

  // Aceptar: create postulacion + accept + assign carga
  await db.$transaction([
    db.postulacion.create({
      data: {
        cargaId,
        transportistaId: session.userId,
        estado: "ACEPTADA",
        camionesCubiertos: 1,
      },
    }),
    db.carga.update({
      where: { id: cargaId },
      data: {
        estado: "ASIGNADA",
        transportistaAsignadoId: session.userId,
      },
    }),
    // Deactivate disponibilidad
    db.disponibilidadTransportista.updateMany({
      where: { transportistaId: session.userId },
      data: { activo: false },
    }),
  ]);

  notifyEmpresa(carga.empresaId).catch(() => {});
  notifyTransportista(session.userId).catch(() => {});
  return NextResponse.json({ ok: true });
}
