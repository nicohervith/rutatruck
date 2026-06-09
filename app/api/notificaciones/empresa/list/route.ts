import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isEmpresa } from "@/lib/roles";

export async function GET() {
  const session = await getSession();
  if (!session || !isEmpresa(session.role)) {
    return NextResponse.json({ notificaciones: [] });
  }

  try {
    const [enConfirmacion, postulacionesNuevas] = await Promise.all([
      db.carga.findMany({
        where: { empresaId: session.userId, estado: "EN_CONFIRMACION" },
        select: { id: true, titulo: true, origen: true, destino: true },
      }),
      db.postulacion.findMany({
        where: {
          carga: { empresaId: session.userId },
          estado: "PENDIENTE",
          vistaEmpresa: false,
        },
        select: {
          id: true,
          carga: { select: { id: true, titulo: true, origen: true, destino: true } },
          transportista: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const notificaciones = [
      ...enConfirmacion.map((c) => ({
        tipo: "confirmacion" as const,
        cargaId: c.id,
        titulo: c.titulo,
        origen: c.origen,
        destino: c.destino,
        extra: null,
      })),
      ...postulacionesNuevas.map((p) => ({
        tipo: "postulacion" as const,
        cargaId: p.carga.id,
        titulo: p.carga.titulo,
        origen: p.carga.origen,
        destino: p.carga.destino,
        extra: p.transportista.name,
      })),
    ];

    return NextResponse.json({ notificaciones });
  } catch {
    return NextResponse.json({ notificaciones: [] });
  }
}
