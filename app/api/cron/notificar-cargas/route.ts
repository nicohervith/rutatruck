import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const cargasActivas = await db.carga.count({ where: { estado: "ACTIVA" } });

  if (cargasActivas === 0) {
    return NextResponse.json({ skipped: true, reason: "sin cargas activas" });
  }

  const suscripciones = await db.pushSubscription.findMany({
    where: { user: { role: "TRANSPORTISTA" } },
  });

  if (suscripciones.length === 0) {
    return NextResponse.json({ skipped: true, reason: "sin suscriptores" });
  }

  const payload = JSON.stringify({
    title: "¡Hay cargas disponibles!",
    body: `${cargasActivas} carga${cargasActivas !== 1 ? "s" : ""} activa${cargasActivas !== 1 ? "s" : ""} esperando transportistas.`,
    url: "/transportista/cargas",
  });

  const resultados = await Promise.allSettled(
    suscripciones.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
        }
        throw err;
      }
    }),
  );

  const enviadas = resultados.filter((r) => r.status === "fulfilled").length;
  const fallidas = resultados.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ ok: true, cargasActivas, enviadas, fallidas });
}
