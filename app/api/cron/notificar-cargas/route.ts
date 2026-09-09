import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendDigestCargasDisponibles } from "@/lib/push";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // `esPrivada: false` replica el filtro del tablero del transportista
  // (app/(transportista)/transportista/cargas/page.tsx). Sin él, el resumen
  // contaba las ofertas dirigidas a un transportista puntual: el push decía
  // "5 cargas disponibles" y al entrar se veían 2.
  const cargas = await db.carga.findMany({
    where: { estado: "ACTIVA", esPrivada: false },
    select: { origenLat: true, origenLng: true },
  });

  if (cargas.length === 0) {
    return NextResponse.json({ skipped: true, reason: "sin cargas activas" });
  }

  // El conteo por transportista y el filtro de zona viven en lib/push.ts: este
  // cron mandaba a todos ignorando notifZonaLat/notifRadioKm porque tenía su
  // propia copia del envío.
  const resultado = await sendDigestCargasDisponibles(cargas);

  if (resultado.suscripciones === 0) {
    return NextResponse.json({ skipped: true, reason: "sin suscriptores" });
  }

  return NextResponse.json({ ok: true, cargasActivas: cargas.length, ...resultado });
}
