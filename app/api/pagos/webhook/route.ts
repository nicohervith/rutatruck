import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { procesarPago } from "@/lib/services/pago.service";

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
