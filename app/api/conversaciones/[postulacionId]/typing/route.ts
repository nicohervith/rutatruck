import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { esParteDelHilo } from "@/lib/repositories/mensaje.repository";
import { chatPushTyping } from "@/lib/sse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postulacionId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { postulacionId: postulacionIdParam } = await params;
  const postulacionId = parseInt(postulacionIdParam);
  if (isNaN(postulacionId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  if (!(await esParteDelHilo(postulacionId, session.userId))) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  chatPushTyping(postulacionId, session.userId);

  return NextResponse.json({ ok: true });
}
