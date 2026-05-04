import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import { obtenerPago } from "@/lib/mercadopago";

function verificarFirma(req: NextRequest, paymentId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secret configurado, skip (solo dev)

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  // x-signature: "ts=<timestamp>,v1=<hmac>"
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
    await db.carga.updateMany({
      where: { id: cargaId, estado: "PENDIENTE_PAGO" },
      data: { estado: "ACTIVA", pagado: true, mpPaymentId: String(pago.id) },
    });
  }
}

// Notificación estilo webhook (nuevo)
export async function POST(req: NextRequest) {
  let body: { type?: string; data?: { id?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Solo procesamos eventos de pago
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
    // Devolvemos 500 para que MP reintente
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Notificación estilo IPN (legado) — MP hace GET con ?id=<id>&topic=payment
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
