import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { enviarMensaje } from "@/lib/services/mensaje.service";
import { chatPush } from "@/lib/sse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cargaId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { cargaId: cargaIdParam } = await params;
  const cargaId = parseInt(cargaIdParam);
  if (isNaN(cargaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: { cuerpo?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (typeof body.cuerpo !== "string") {
    return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
  }

  const result = await enviarMensaje(cargaId, session.userId, body.cuerpo);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  chatPush(cargaId, [result.mensaje]);

  return NextResponse.json({ mensaje: result.mensaje }, { status: 201 });
}
