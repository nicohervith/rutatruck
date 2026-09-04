import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { crearResenaViaje } from "@/lib/services/resena.service";
import type { CriterioKey } from "@/lib/resenas";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: {
    cargaId?: number;
    destinatarioId?: string;
    puntajes?: Partial<Record<CriterioKey, number>>;
    comentario?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.cargaId || !body.destinatarioId || !body.puntajes) {
    return NextResponse.json({ error: "Faltan datos de la reseña" }, { status: 400 });
  }

  const result = await crearResenaViaje(session.userId, {
    cargaId: body.cargaId,
    destinatarioId: body.destinatarioId,
    puntajes: body.puntajes,
    comentario: body.comentario ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, publicada: result.publicada }, { status: 201 });
}
