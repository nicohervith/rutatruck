import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { isTransportista } from "@/lib/roles";
import { completarViaje } from "@/lib/services/carga.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!isTransportista(session.role)) return NextResponse.json({ error: "Solo transportistas" }, { status: 403 });

  const { id } = await params;
  const cargaId = parseInt(id);
  if (isNaN(cargaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const result = await completarViaje(cargaId, session.userId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
