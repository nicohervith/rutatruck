import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { isTransportista } from "@/lib/roles";
import { marcarPostulacionesVistasTransportista } from "@/lib/services/postulacion.service";

export async function POST() {
  const session = await getSession();
  if (!session || !isTransportista(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await marcarPostulacionesVistasTransportista(session.userId);

  return NextResponse.json({ ok: true });
}
