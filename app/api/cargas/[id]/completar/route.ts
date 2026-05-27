import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { sendPushToUser } from "@/lib/push";
import { isTransportista } from "@/lib/roles";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!isTransportista(session.role)) return NextResponse.json({ error: "Solo transportistas" }, { status: 403 });

  const { id } = await params;
  const cargaId = parseInt(id);
  if (isNaN(cargaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const carga = await db.carga.findUnique({
    where: { id: cargaId, transportistaAsignadoId: session.userId, estado: "ASIGNADA" },
  });
  if (!carga) return NextResponse.json({ error: "Carga no encontrada" }, { status: 404 });

  await db.carga.update({
    where: { id: cargaId },
    data: { estado: "EN_CONFIRMACION" },
  });

  sendPushToUser(carga.empresaId, {
    title: "Viaje marcado como completado",
    body: `El transportista marcó "${carga.titulo}" como completado. Confirmá o abrí una disputa.`,
    url: `/empresa/cargas/${cargaId}`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
