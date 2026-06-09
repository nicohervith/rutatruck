import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import { isTransportista } from "@/lib/roles";
import { notifyEmpresa } from "@/lib/sse";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTransportista(session.role)) {
    return NextResponse.json({ error: "Solo transportistas pueden postularse" }, { status: 403 });
  }

  let body: { cargaId: number; mensaje?: string; contactoEmail?: string; contactoTelefono?: string; camionesCubiertos?: number; precioOfrecido?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.cargaId) {
    return NextResponse.json({ error: "Falta cargaId" }, { status: 400 });
  }

  const [carga, cargasEnViaje] = await Promise.all([
    db.carga.findUnique({
      where: { id: body.cargaId, estado: "ACTIVA" },
      select: { id: true, titulo: true, empresaId: true, fechaCarga: true },
    }),
    db.carga.findMany({
      where: {
        transportistaAsignadoId: session.userId,
        estado: { in: ["ASIGNADA", "PENDIENTE_PAGO_TRANSPORTISTA"] },
      },
      select: { id: true, fechaCarga: true, fechaCupo: true, titulo: true },
    }),
  ]);

  if (!carga) {
    return NextResponse.json({ error: "Carga no encontrada o no disponible" }, { status: 404 });
  }

  // Check date conflicts with active trips
  const conflicto = cargasEnViaje.find((c) => {
    const endDate = c.fechaCupo ?? c.fechaCarga;
    return carga.fechaCarga <= endDate;
  });
  if (conflicto) {
    return NextResponse.json(
      {
        error: "Tenés una carga en viaje que coincide con esta fecha. Completá tus viajes activos antes de postularte a cargas en la misma fecha.",
        code: "DATE_CONFLICT",
      },
      { status: 409 },
    );
  }

  try {
    const postulacion = await db.postulacion.create({
      data: {
        cargaId: body.cargaId,
        transportistaId: session.userId,
        mensaje: body.mensaje ?? null,
        contactoEmail: body.contactoEmail ?? null,
        contactoTelefono: body.contactoTelefono ?? null,
        camionesCubiertos: Math.max(1, body.camionesCubiertos ?? 1),
        precioOfrecido: body.precioOfrecido ?? null,
      },
    });

    sendPushToUser(carga.empresaId, {
      title: "Nueva postulación",
      body: `Un transportista se postuló a "${carga.titulo}"`,
      url: `/empresa/cargas/${carga.id}`,
    }).catch(() => {});
    notifyEmpresa(carga.empresaId).catch(() => {});

    return NextResponse.json({ id: postulacion.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya te postulaste a esta carga" }, { status: 409 });
  }
}
