import { NextRequest, NextResponse } from "next/server";
import { enviarRecordatoriosCompletar } from "@/lib/services/carga.service";
import { eliminarMensajesFinalizadosVencidos } from "@/lib/repositories/mensaje.repository";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [result, mensajesEliminados] = await Promise.all([
    enviarRecordatoriosCompletar(),
    eliminarMensajesFinalizadosVencidos(),
  ]);

  return NextResponse.json({ ...result, mensajesEliminados });
}
