import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isEmpresa } from "@/lib/roles";
import { sendPushToUser } from "@/lib/push";
import { notifyTransportista } from "@/lib/sse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || !isEmpresa(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: transportistaId } = await params;

  // empresa_transportista can't solicit themselves
  if (transportistaId === session.userId) {
    return NextResponse.json({ error: "No podés solicitarte a vos mismo" }, { status: 400 });
  }

  const [transportista, empresa] = await Promise.all([
    db.user.findUnique({ where: { id: transportistaId }, select: { id: true } }),
    db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, email: true, phone: true },
    }),
  ]);
  if (!transportista) {
    return NextResponse.json({ error: "Transportista no encontrado" }, { status: 404 });
  }

  let body: {
    titulo: string;
    origen: string;
    destino: string;
    tipoCarga: string;
    fechaCarga: string;
    presupuesto?: number | null;
    descripcion?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.titulo || !body.origen || !body.destino || !body.tipoCarga || !body.fechaCarga) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const carga = await db.carga.create({
    data: {
      titulo: body.titulo,
      origen: body.origen,
      destino: body.destino,
      tipoCarga: body.tipoCarga,
      fechaCarga: new Date(body.fechaCarga),
      presupuesto: body.presupuesto ?? null,
      descripcion: body.descripcion ?? null,
      contactoNombre: empresa?.name ?? "Empresa",
      contactoTelefono: empresa?.phone ?? "",
      contactoEmail: empresa?.email ?? "",
      empresaId: session.userId,
      estado: "ACTIVA",
      pagado: true,
      esPrivada: true,
      transportistaDestinadoId: transportistaId,
    },
  });

  sendPushToUser(transportistaId, {
    title: "Nueva oferta directa",
    body: `Una empresa te ofrece un servicio: ${carga.titulo}`,
    url: `/transportista/cargas/${carga.id}`,
  }).catch(() => {});
  notifyTransportista(transportistaId).catch(() => {});

  return NextResponse.json({ id: carga.id }, { status: 201 });
}
