import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const externalReference = searchParams.get("external_reference");
  const status = searchParams.get("status") ?? searchParams.get("collection_status");
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("collection_id");

  if (!externalReference || status !== "approved") {
    return NextResponse.redirect(
      new URL(`/api/pagos/failure?external_reference=${externalReference ?? ""}`, req.nextUrl),
    );
  }

  // Publicación de carga: "publicar_{cargaId}"
  const matchPublicar = externalReference.match(/^publicar_(\d+)$/);
  if (matchPublicar) {
    const cargaId = parseInt(matchPublicar[1]);
    try {
      await db.carga.update({
        where: { id: cargaId, estado: "PENDIENTE_PAGO" },
        data: { estado: "ACTIVA", pagado: true, mpPaymentId: paymentId ?? null },
      });
    } catch {
      return NextResponse.redirect(new URL("/empresa/cargas?error=pago", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/empresa/cargas?success=1", req.nextUrl));
  }

  return NextResponse.redirect(new URL("/empresa/cargas", req.nextUrl));
}
