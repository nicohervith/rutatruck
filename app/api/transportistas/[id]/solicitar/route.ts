import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { isEmpresa } from "@/lib/roles";
import { crearOfertaPrivada } from "@/lib/services/carga.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || !isEmpresa(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: transportistaId } = await params;

  let body: {
    titulo: string;
    origen: string;
    destino: string;
    tipoCarga: string;
    fechaCarga: string;
    presupuesto?: number | null;
    descripcion?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.titulo || !body.origen || !body.destino || !body.tipoCarga || !body.fechaCarga) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const result = await crearOfertaPrivada(session.userId, transportistaId, {
    titulo: body.titulo,
    origen: body.origen,
    destino: body.destino,
    tipoCarga: body.tipoCarga,
    fechaCarga: new Date(body.fechaCarga),
    presupuesto: body.presupuesto ?? null,
    descripcion: body.descripcion ?? null,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ id: result.cargaId }, { status: 201 });
}
