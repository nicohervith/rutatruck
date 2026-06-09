import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isTransportista } from "@/lib/roles";
import { notifyTransportista } from "@/lib/sse";

export async function POST() {
  const session = await getSession();
  if (!session || !isTransportista(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await db.postulacion.updateMany({
    where: {
      transportistaId: session.userId,
      estado: "ACEPTADA",
      vistaTransportista: false,
    },
    data: { vistaTransportista: true },
  });

  notifyTransportista(session.userId).catch(() => {});
  return NextResponse.json({ ok: true });
}
