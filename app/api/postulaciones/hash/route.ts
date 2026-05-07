import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "TRANSPORTISTA") {
    return NextResponse.json({ hash: "" });
  }

  const postulaciones = await db.postulacion.findMany({
    where: { transportistaId: session.userId },
    select: {
      id: true,
      estado: true,
      carga: { select: { estado: true } },
    },
    orderBy: { id: "asc" },
  });

  const hash = postulaciones
    .map((p) => `${p.id}:${p.estado}:${p.carga.estado}`)
    .join(",");

  return NextResponse.json({ hash });
}
