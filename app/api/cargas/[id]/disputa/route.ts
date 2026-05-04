import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { EstadoCarga } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.role !== "EMPRESA" && session.role !== "TRANSPORTISTA") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const cargaId = parseInt(id);
  if (isNaN(cargaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let body: { descripcion?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.descripcion?.trim()) {
    return NextResponse.json({ error: "Descripción requerida" }, { status: 400 });
  }

  const estadosValidos: EstadoCarga[] = ["ASIGNADA", "EN_CONFIRMACION"];

  let carga;
  if (session.role === "EMPRESA") {
    carga = await db.carga.findFirst({
      where: { id: cargaId, empresaId: session.userId, estado: { in: estadosValidos } },
    });
  } else {
    carga = await db.carga.findFirst({
      where: { id: cargaId, transportistaAsignadoId: session.userId, estado: { in: estadosValidos } },
    });
  }

  if (!carga) return NextResponse.json({ error: "Carga no encontrada" }, { status: 404 });

  await db.carga.update({
    where: { id: cargaId },
    data: {
      estado: "DISPUTA",
      disputaDescripcion: body.descripcion.trim(),
      disputaAbiertaPor: session.role,
    },
  });

  return NextResponse.json({ ok: true });
}
