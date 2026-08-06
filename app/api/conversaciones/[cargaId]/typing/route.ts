import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { findCargaParaChat } from "@/lib/repositories/mensaje.repository";
import { chatPushTyping } from "@/lib/sse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cargaId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cargaId: cargaIdParam } = await params;
  const cargaId = parseInt(cargaIdParam);
  if (isNaN(cargaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const carga = await findCargaParaChat(cargaId, session.userId);
  if (!carga) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  chatPushTyping(cargaId, session.userId);

  return NextResponse.json({ ok: true });
}
