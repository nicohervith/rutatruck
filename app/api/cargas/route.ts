import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.role !== "EMPRESA") {
    return NextResponse.json(
      { error: "Solo empresas pueden publicar cargas" },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const {
    titulo,
    origen,
    destino,
    tipoCarga,
    peso,
    volumen,
    presupuesto,
    fechaCarga,
    fechaEntrega,
    tiempoEstimado,
    descripcion,
    contactoNombre,
    contactoTelefono,
    contactoEmail,
  } = body as Record<string, string>;

  if (
    !titulo ||
    !origen ||
    !destino ||
    !tipoCarga ||
    !fechaCarga ||
    !contactoNombre ||
    !contactoTelefono ||
    !contactoEmail
  ) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 },
    );
  }

  const carga = await db.carga.create({
    data: {
      titulo,
      origen,
      destino,
      tipoCarga,
      peso: peso ? parseFloat(peso) : null,
      volumen: volumen ? parseFloat(volumen as string) : null,
      presupuesto: presupuesto ? parseFloat(presupuesto as string) : null,
      fechaCarga: new Date(fechaCarga),
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega as string) : null,
      tiempoEstimado: (tiempoEstimado as string) || null,
      descripcion: (descripcion as string) || null,
      contactoNombre,
      contactoTelefono,
      contactoEmail,
      empresaId: session.userId,
      estado: "ACTIVA",
    },
  });

  return NextResponse.json({ id: carga.id }, { status: 201 });
}
