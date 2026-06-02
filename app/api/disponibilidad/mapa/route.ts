import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isEmpresa } from "@/lib/roles";

export async function GET() {
  const session = await getSession();
  if (!session || !isEmpresa(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const cutoff7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const disponibilidades = await db.disponibilidadTransportista.findMany({
    where: {
      activo: true,
      OR: [
        { disponibleHoy: true, actualizadoEn: { gte: cutoff24h } },
        { disponibleHoy: false, actualizadoEn: { gte: cutoff7d } },
      ],
    },
    select: {
      id: true,
      transportistaId: true,
      vehiculo: true,
      zona: true,
      lat: true,
      lng: true,
      radioKm: true,
      regresoVacio: true,
      buscaCarga: true,
      voyAPuerto: true,
      disponibleHoy: true,
      salidaDesde: true,
      salidaDestino: true,
      actualizadoEn: true,
    },
  });

  const favs = await db.favoritoTransportista.findMany({
    where: { empresaId: session.userId },
    select: { transportistaId: true },
  });
  const favSet = new Set(favs.map((f: { transportistaId: string }) => f.transportistaId));

  const result = disponibilidades.map((d: typeof disponibilidades[0]) => ({
    ...d,
    esFavorito: favSet.has(d.transportistaId),
  }));

  return NextResponse.json({ disponibilidades: result });
}
