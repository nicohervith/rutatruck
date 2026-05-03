import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "TRANSPORTISTA") {
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

  return NextResponse.json({ ok: true });
}
