import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isTransportista } from "@/lib/roles";

export async function GET() {
  const session = await getSession();
  if (!session || !isTransportista(session.role)) {
    return NextResponse.json({ notificaciones: [] });
  }

  const postulaciones = await db.postulacion.findMany({
    where: {
      transportistaId: session.userId,
      estado: "ACEPTADA",
      vistaTransportista: false,
    },
    select: {
      id: true,
      carga: {
        select: { id: true, titulo: true, origen: true, destino: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ notificaciones: postulaciones });
}
