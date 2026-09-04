import { NextRequest, NextResponse } from "next/server";
import { cerrarViajesAbandonados } from "@/lib/services/carga.service";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await cerrarViajesAbandonados();
  return NextResponse.json(result);
}
