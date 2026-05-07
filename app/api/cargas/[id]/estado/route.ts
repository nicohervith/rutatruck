import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { expirarSeleccion } from "@/lib/comision";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ estado: null });

  const { id } = await params;
  const cargaId = parseInt(id);
  if (isNaN(cargaId)) return NextResponse.json({ estado: null });

  const carga = await db.carga.findUnique({
    where: { id: cargaId },
    select: { estado: true, transportistaPagoDeadline: true },
  });

  if (!carga) return NextResponse.json({ estado: null });

  // Lazy expiration: if deadline passed, revert to ACTIVA
  if (
    carga.estado === "PENDIENTE_PAGO_TRANSPORTISTA" &&
    carga.transportistaPagoDeadline &&
    carga.transportistaPagoDeadline < new Date()
  ) {
    await expirarSeleccion(cargaId);
    return NextResponse.json({ estado: "ACTIVA" });
  }

  return NextResponse.json({ estado: carga.estado });
}
