import { NextRequest, NextResponse } from "next/server";
import { enviarRecordatoriosSinPostulantes } from "@/lib/services/carga.service";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await enviarRecordatoriosSinPostulantes();
  return NextResponse.json(result);
}
