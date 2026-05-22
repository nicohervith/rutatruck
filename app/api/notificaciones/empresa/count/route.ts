import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isEmpresa } from "@/lib/roles";

export async function GET() {
  const session = await getSession();
  if (!session || !isEmpresa(session.role)) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const [enConfirmacion, postulacionesNuevas] = await Promise.all([
      db.carga.count({
        where: {
          empresaId: session.userId,
          estado: "EN_CONFIRMACION",
        },
      }),
      db.postulacion.count({
        where: {
          carga: { empresaId: session.userId },
          estado: "PENDIENTE",
          vistaEmpresa: false,
        },
      }),
    ]);
    return NextResponse.json({ count: enConfirmacion + postulacionesNuevas });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
