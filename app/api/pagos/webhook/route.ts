import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { obtenerPago } from "@/lib/mercadopago";
import { sendPushToAllTransportistas } from "@/lib/push";

function verificarFirma(req: NextRequest, paymentId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => part.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const signedData = `id:${paymentId};request-id:${xRequestId};ts:${ts}`;
  const expected = createHmac("sha256", secret).update(signedData).digest("hex");

  return expected === v1;
}

async function procesarPago(paymentId: string) {
  const pago = await obtenerPago(paymentId);

  if (pago.status !== "approved") return;

  const externalReference = pago.external_reference;
  if (!externalReference) return;

  const matchPublicar = externalReference.match(/^publicar_(\d+)$/);
  if (matchPublicar) {
    const cargaId = parseInt(matchPublicar[1]);
    const carga = await db.carga.findUnique({
      where: { id: cargaId, estado: "PENDIENTE_PAGO" },
      select: { id: true, titulo: true, origen: true, destino: true, empresaId: true },
    });
    if (carga) {
      await db.carga.update({
        where: { id: cargaId },
        data: { estado: "ACTIVA", pagado: true, mpPaymentId: String(pago.id) },
      });
      void sendPushToAllTransportistas({
        title: "Nueva carga disponible",
        body: `${carga.titulo} · ${carga.origen} → ${carga.destino}`,
        url: "/transportista/cargas",
      }, carga.empresaId);
    }
    return;
  }

  const matchComision = externalReference.match(/^comision_carga_(\d+)$/);
  if (matchComision) {
    const cargaId = parseInt(matchComision[1]);
    await db.$transaction([
      db.carga.updateMany({
        where: { id: cargaId, estado: "PENDIENTE_PAGO_TRANSPORTISTA" },
        data: {
          estado: "ASIGNADA",
          transportistaMpPaymentId: String(pago.id),
          transportistaPagoDeadline: null,
        },
      }),
      db.postulacion.updateMany({
        where: { cargaId, estado: "PENDIENTE" },
        data: { estado: "RECHAZADA" },
      }),
    ]);
  }
}

export async function POST(req: NextRequest) {
  let body: { type?: string; data?: { id?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (body.type !== "payment") {
    return NextResponse.json({ ok: true });
  }

  const paymentId = body.data?.id;
  if (!paymentId) return NextResponse.json({ ok: true });

  if (!verificarFirma(req, paymentId)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  try {
    await procesarPago(paymentId);
  } catch (err) {
    console.error("[webhook/mp] error procesando pago", paymentId, err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const topic = searchParams.get("topic") ?? searchParams.get("type");
  const paymentId = searchParams.get("id");

  if (topic !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    await procesarPago(paymentId);
  } catch (err) {
    console.error("[webhook/mp IPN] error procesando pago", paymentId, err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
