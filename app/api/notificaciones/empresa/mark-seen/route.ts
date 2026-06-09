import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isEmpresa } from "@/lib/roles";

export async function POST() {
  const session = await getSession();
  if (!session || !isEmpresa(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await db.postulacion.updateMany({
    where: {
      carga: { empresaId: session.userId },
      estado: "PENDIENTE",
      vistaEmpresa: false,
    },
    data: { vistaEmpresa: true },
  });

  return NextResponse.json({ ok: true });
}
