import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Da de baja la subscripción push de ESTE dispositivo. La llama el login (ver
 * PurgeAuthedPush): al cerrar sesión el navegador conservaba su subscripción y
 * el server su fila, así que los push del usuario anterior — con el preview de
 * sus mensajes incluido — le seguían llegando a quien tuviera el teléfono.
 *
 * No exige sesión a propósito: quien la llama acaba de perder la suya. Sin
 * sesión, lo único que identifica al dispositivo es el endpoint, que es una URL
 * de alta entropía que solo conocen ese navegador y este server; y el peor caso
 * de un borrado indebido es que un dispositivo deje de recibir notificaciones,
 * exactamente lo que su dueño puede hacer desde el navegador.
 *
 * Borra solo el endpoint recibido, nunca todas las subscripciones del usuario:
 * puede estar logueado en otro dispositivo y ahí las notificaciones siguen.
 */
export async function POST(req: NextRequest) {
  let body: { endpoint?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.endpoint) {
    return NextResponse.json({ error: "Falta endpoint" }, { status: 400 });
  }

  const { count } = await db.pushSubscription.deleteMany({
    where: { endpoint: body.endpoint },
  });

  return NextResponse.json({ ok: true, eliminadas: count });
}
