import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "TRANSPORTISTA") {
    return NextResponse.json({ count: 0 });
  }

  const count = await db.postulacion.count({
    where: {
      transportistaId: session.userId,
      estado: "ACEPTADA",
      vistaTransportista: false,
    },
  });

  return NextResponse.json({ count });
}
