import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { crearPreferencia } from "@/lib/mercadopago";
import { getComisionConfig, calcularComision } from "@/lib/comision";
import { isTransportista } from "@/lib/roles";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isTransportista(session.role)) {
    return NextResponse.json(
      { error: "Solo transportistas pueden pagar la comisión" },
      { status: 403 },
    );
  }

  let body: { cargaId: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const carga = await db.carga.findUnique({
    where: {
      id: body.cargaId,
      estado: "PENDIENTE_PAGO_TRANSPORTISTA",
      transportistaAsignadoId: session.userId,
    },
  });

  if (!carga) {
    return NextResponse.json({ error: "Carga no encontrada" }, { status: 404 });
  }

  // Check deadline not expired
  if (carga.transportistaPagoDeadline && carga.transportistaPagoDeadline < new Date()) {
    return NextResponse.json({ error: "El tiempo para pagar venció" }, { status: 400 });
  }

  const config = await getComisionConfig();
  const monto = calcularComision(config, carga.presupuesto);

  const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
  const externalReference = `comision_carga_${carga.id}`;

  const preference = await crearPreferencia({
    items: [
      {
        id: carga.id.toString(),
        title: `Comisión: ${carga.titulo}`,
        description: `${carga.origen} → ${carga.destino}`,
        quantity: 1,
        unit_price: monto,
        currency_id: "ARS",
      },
    ],
    external_reference: externalReference,
    back_urls: {
      success: `${origin}/api/pagos/success`,
      failure: `${origin}/api/pagos/failure`,
      pending: `${origin}/api/pagos/failure`,
    },
    auto_return: "approved",
    statement_descriptor: "ClickCargo",
  });

  const url =
    process.env.NODE_ENV === "production"
      ? preference.init_point
      : preference.sandbox_init_point;

  if (!url) {
    return NextResponse.json(
      { error: "Error al crear preferencia de pago" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url });
}
