import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { isEmpresa } from "@/lib/roles";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isEmpresa(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { transportistaId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { transportistaId } = body;
  if (!transportistaId) {
    return NextResponse.json({ error: "transportistaId requerido" }, { status: 400 });
  }

  const key = { empresaId: session.userId, transportistaId };

  const existing = await db.favoritoTransportista.findUnique({
    where: { empresaId_transportistaId: key },
  });

  if (existing) {
    await db.favoritoTransportista.delete({ where: { empresaId_transportistaId: key } });
    return NextResponse.json({ favorito: false });
  }

  await db.favoritoTransportista.create({ data: key });
  return NextResponse.json({ favorito: true });
}
