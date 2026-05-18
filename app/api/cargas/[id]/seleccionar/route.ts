import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import { DEADLINE_HORAS } from "@/lib/comision";

const FREE_TIER = process.env.FREE_TIER === "true";

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

  if (FREE_TIER) {
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
    ]);

    sendPushToUser(postulacion.transportistaId, {
      title: "¡Fuiste seleccionado!",
      body: `Sos el transportista asignado para "${carga.titulo}". Contactate con la empresa para coordinar.`,
      url: `/transportista/cargas/${cargaId}`,
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  }

  const deadline = new Date(Date.now() + DEADLINE_HORAS() * 60 * 60 * 1000);

  await db.$transaction([
    db.carga.update({
      where: { id: cargaId },
      data: {
        estado: "PENDIENTE_PAGO_TRANSPORTISTA",
        transportistaAsignadoId: postulacion.transportistaId,
        transportistaPagoDeadline: deadline,
      },
    }),
    db.postulacion.update({
      where: { id: body.postulacionId },
      data: { estado: "ACEPTADA" },
    }),
  ]);

  sendPushToUser(postulacion.transportistaId, {
    title: "¡Fuiste seleccionado!",
    body: `Tenés ${DEADLINE_HORAS()} horas para pagar la comisión y confirmar el viaje "${carga.titulo}".`,
    url: `/transportista/cargas/${cargaId}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
