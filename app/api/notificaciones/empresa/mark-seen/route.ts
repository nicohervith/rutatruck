import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { isEmpresa } from "@/lib/roles";
import { marcarPostulacionesVistasEmpresa } from "@/lib/services/postulacion.service";

export async function POST() {
  const session = await getSession();
  if (!session || !isEmpresa(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await marcarPostulacionesVistasEmpresa(session.userId);

  return NextResponse.json({ ok: true });
}
