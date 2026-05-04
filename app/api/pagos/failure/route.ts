import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const externalReference = req.nextUrl.searchParams.get("external_reference");

  if (externalReference) {
    const matchPublicar = externalReference.match(/^publicar_(\d+)$/);
    if (matchPublicar) {
      const cargaId = parseInt(matchPublicar[1]);
      await db.carga.deleteMany({
        where: { id: cargaId, estado: "PENDIENTE_PAGO" },
      });
      return NextResponse.redirect(
        new URL("/empresa/cargas/nueva?error=pago_cancelado", req.nextUrl),
      );
    }
  }

  return NextResponse.redirect(new URL("/empresa/cargas", req.nextUrl));
}
