import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isEmpresa } from "@/lib/roles";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!isEmpresa(session.role)) return NextResponse.json({ error: "Solo empresas" }, { status: 403 });

  const { id } = await params;
  const cargaId = parseInt(id);
  if (isNaN(cargaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const carga = await db.carga.findUnique({
    where: { id: cargaId, empresaId: session.userId, estado: "ACTIVA" },
  });
  if (!carga) return NextResponse.json({ error: "Carga no encontrada o no editable" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const {
    titulo, origen, destino, cantidadCamiones, tipoCarga, tipoCargaDetalle,
    peso, pesoUnidad, volumen, presupuesto,
    fechaCarga, fechaCupo, preferenciaCamion,
    descripcion,
    contactoNombre, contactoTelefono, contactoEmail,
  } = body;

  if (!titulo || !origen || !destino || !tipoCarga || !fechaCarga || !contactoNombre || !contactoTelefono || !contactoEmail) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  await db.carga.update({
    where: { id: cargaId },
    data: {
      titulo: String(titulo),
      origen: String(origen),
      destino: String(destino),
      cantidadCamiones: cantidadCamiones !== undefined && cantidadCamiones !== "" ? parseInt(String(cantidadCamiones)) : undefined,
      tipoCarga: String(tipoCarga),
      tipoCargaDetalle: tipoCargaDetalle && String(tipoCargaDetalle) !== "" ? String(tipoCargaDetalle) : null,
      peso: peso !== undefined && peso !== "" ? parseFloat(String(peso)) : null,
      pesoUnidad: pesoUnidad && String(pesoUnidad) !== "" ? String(pesoUnidad) : null,
      volumen: volumen !== undefined && volumen !== "" ? parseFloat(String(volumen)) : null,
      ...(carga.transportistaAsignadoId === null && {
        presupuesto: presupuesto !== undefined && presupuesto !== "" ? parseFloat(String(presupuesto)) : null,
      }),
      fechaCarga: new Date(String(fechaCarga)),
      fechaCupo: fechaCupo && String(fechaCupo) !== "" ? new Date(String(fechaCupo)) : null,
      preferenciaCamion: preferenciaCamion && String(preferenciaCamion) !== "" ? String(preferenciaCamion) : null,
      descripcion: descripcion && String(descripcion) !== "" ? String(descripcion) : null,
      contactoNombre: String(contactoNombre),
      contactoTelefono: String(contactoTelefono),
      contactoEmail: String(contactoEmail),
    },
  });

  return NextResponse.json({ ok: true });
}
