import { NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "EMPRESA") {
    return NextResponse.json({ count: 0 });
  }

  const count = await db.carga.count({
    where: {
      empresaId: session.userId,
      estado: "EN_CONFIRMACION",
    },
  });

  return NextResponse.json({ count });
}
