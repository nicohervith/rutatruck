import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";

export async function POST(
  _req: NextRequest,
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

  const carga = await db.carga.findUnique({
    where: { id: cargaId, empresaId: session.userId, estado: "ACTIVA" },
    include: {
      postulaciones: { where: { estado: "ACEPTADA" }, select: { transportistaId: true } },
    },
  });
  if (!carga) {
    return NextResponse.json({ error: "Carga no encontrada o no está activa" }, { status: 404 });
  }

  if (carga.postulaciones.length === 0) {
    return NextResponse.json({ error: "Debe aceptar al menos un transportista antes de cerrar" }, { status: 400 });
  }

  await db.carga.update({
    where: { id: cargaId },
    data: {
      estado: "ASIGNADA",
      // For single-camion compat
      ...(carga.cantidadCamiones === 1 && carga.postulaciones[0]
        ? { transportistaAsignadoId: carga.postulaciones[0].transportistaId }
        : {}),
    },
  });

  await Promise.all(
    carga.postulaciones.map((p) =>
      sendPushToUser(p.transportistaId, {
        title: "¡Convocatoria cerrada!",
        body: `Fuiste asignado para "${carga.titulo}". Contactate con la empresa para coordinar.`,
        url: `/transportista/cargas/${cargaId}`,
      }).catch(() => {}),
    ),
  );

  return NextResponse.json({ ok: true });
}
