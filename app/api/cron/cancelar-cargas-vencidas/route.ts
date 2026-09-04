import { NextRequest, NextResponse } from "next/server";
import {
  cancelarCargasVencidasSinAceptar,
  cancelarPendientesDePagoVencidas,
  purgarCargasCanceladas,
} from "@/lib/services/carga.service";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const vencidas = await cancelarCargasVencidasSinAceptar();
  const sinPagar = await cancelarPendientesDePagoVencidas();
  // Después de las dos cancelaciones: las que acaban de pasar a CANCELADA
  // tienen updatedAt de recién, así que no las agarra la purga.
  const canceladas = await purgarCargasCanceladas();
  return NextResponse.json({ vencidas, sinPagar, canceladas });
}
