import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import { notifyTransportista } from "@/lib/sse";
import { DEADLINE_HORAS } from "@/lib/comision";
import { isEmpresa } from "@/lib/roles";

const FREE_TIER = process.env.FREE_TIER === "true";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isEmpresa(session.role)) {
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

  // Accept this postulacion
  await db.postulacion.update({
    where: { id: body.postulacionId },
    data: { estado: "ACEPTADA" },
  });

  // Calculate total covered after this acceptance
  const aceptadas = await db.postulacion.findMany({
    where: { cargaId, estado: "ACEPTADA" },
    select: { camionesCubiertos: true },
  });
  const totalCubiertos = aceptadas.reduce((sum, p) => sum + p.camionesCubiertos, 0);
  const convocatoriaCubierta = totalCubiertos >= carga.cantidadCamiones;

  if (FREE_TIER) {
    if (convocatoriaCubierta) {
      await db.$transaction([
        db.carga.update({
          where: { id: cargaId },
          data: {
            estado: "ASIGNADA",
            ...(carga.cantidadCamiones === 1
              ? { transportistaAsignadoId: postulacion.transportistaId }
              : {}),
          },
        }),
        db.disponibilidadTransportista.updateMany({
          where: { transportistaId: postulacion.transportistaId },
          data: { activo: false },
        }),
      ]);
    }

    sendPushToUser(postulacion.transportistaId, {
      title: "¡Fuiste seleccionado!",
      body: convocatoriaCubierta
        ? `Sos el transportista asignado para "${carga.titulo}". Contactate con la empresa para coordinar.`
        : `Fuiste aceptado para "${carga.titulo}". La empresa está coordinando los transportistas restantes.`,
      url: `/transportista/cargas/${cargaId}`,
    }).catch(() => {});
    notifyTransportista(postulacion.transportistaId).catch(() => {});

    return NextResponse.json({ ok: true, cubiertos: totalCubiertos, necesarios: carga.cantidadCamiones });
  }

  // Non-FREE_TIER: only support single-camion payment flow for now
  const deadline = new Date(Date.now() + DEADLINE_HORAS() * 60 * 60 * 1000);

  await db.carga.update({
    where: { id: cargaId },
    data: {
      estado: "PENDIENTE_PAGO_TRANSPORTISTA",
      transportistaAsignadoId: postulacion.transportistaId,
      transportistaPagoDeadline: deadline,
    },
  });

  sendPushToUser(postulacion.transportistaId, {
    title: "¡Fuiste seleccionado!",
    body: `Tenés ${DEADLINE_HORAS()} horas para pagar la comisión y confirmar el viaje "${carga.titulo}".`,
    url: `/transportista/cargas/${cargaId}`,
  }).catch(() => {});
  notifyTransportista(postulacion.transportistaId).catch(() => {});

  return NextResponse.json({ ok: true, cubiertos: totalCubiertos, necesarios: carga.cantidadCamiones });
}
