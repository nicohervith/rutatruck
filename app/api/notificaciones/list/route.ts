import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isTransportista } from "@/lib/roles";

export async function GET() {
  const session = await getSession();
  if (!session || !isTransportista(session.role)) {
    return NextResponse.json({ notificaciones: [] });
  }

  const select = {
    id: true,
    carga: {
      select: { id: true, titulo: true, origen: true, destino: true },
    },
  } as const;

  const [nuevas, vistas] = await Promise.all([
    db.postulacion.findMany({
      where: { transportistaId: session.userId, estado: "ACEPTADA", vistaTransportista: false },
      select,
      orderBy: { updatedAt: "desc" },
    }),
    db.postulacion.findMany({
      where: { transportistaId: session.userId, estado: "ACEPTADA", vistaTransportista: true },
      select,
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);

  const notificaciones = [
    ...nuevas.map((p) => ({ ...p, vista: false })),
    ...vistas.map((p) => ({ ...p, vista: true })),
  ];

  return NextResponse.json({ notificaciones });
}
