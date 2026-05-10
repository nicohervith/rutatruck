import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { precioPublicacion?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const precio = body.precioPublicacion;
  if (typeof precio !== "number" || precio < 0) {
    return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
  }

  await db.configApp.upsert({
    where: { id: 1 },
    create: { id: 1, comisionTipo: "FIJO", comisionValor: 100, precioPublicacion: precio },
    update: { precioPublicacion: precio },
  });

  return NextResponse.json({ ok: true });
}
