import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const externalReference = searchParams.get("external_reference");
  const status = searchParams.get("status") ?? searchParams.get("collection_status");
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("collection_id");

  if (!externalReference || status !== "approved") {
    return NextResponse.redirect(
      new URL(`/api/pagos/failure?external_reference=${externalReference ?? ""}`, req.nextUrl)
    );
  }

  // Parse "carga_{cargaId}_post_{postulacionId}"
  const match = externalReference.match(/^carga_(\d+)_post_(\d+)$/);
  if (!match) {
    return NextResponse.redirect(new URL("/empresa/cargas", req.nextUrl));
  }

  const cargaId = parseInt(match[1]);
  const postulacionId = parseInt(match[2]);

  try {
    const postulacion = await db.postulacion.findUnique({
      where: { id: postulacionId, cargaId },
    });

    if (!postulacion) {
      return NextResponse.redirect(new URL("/empresa/cargas?error=pago", req.nextUrl));
    }

    await db.$transaction([
      db.carga.update({
        where: { id: cargaId },
        data: {
          estado: "ASIGNADA",
          transportistaAsignadoId: postulacion.transportistaId,
          mpPaymentId: paymentId ?? null,
        },
      }),
      db.postulacion.update({
        where: { id: postulacionId },
        data: { estado: "ACEPTADA" },
      }),
      db.postulacion.updateMany({
        where: { cargaId, id: { not: postulacionId }, estado: "PENDIENTE" },
        data: { estado: "RECHAZADA" },
      }),
    ]);
  } catch {
    return NextResponse.redirect(new URL("/empresa/cargas?error=pago", req.nextUrl));
  }

  return NextResponse.redirect(new URL(`/empresa/cargas/${cargaId}`, req.nextUrl));
}
