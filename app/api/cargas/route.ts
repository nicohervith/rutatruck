import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { crearPreferencia } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.role !== "EMPRESA") {
    return NextResponse.json(
      { error: "Solo empresas pueden publicar cargas" },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const {
    titulo,
    origen,
    destino,
    tipoCarga,
    peso,
    volumen,
    presupuesto,
    fechaCarga,
    fechaEntrega,
    tiempoEstimado,
    descripcion,
    contactoNombre,
    contactoTelefono,
    contactoEmail,
  } = body as Record<string, string>;

  if (
    !titulo ||
    !origen ||
    !destino ||
    !tipoCarga ||
    !fechaCarga ||
    !contactoNombre ||
    !contactoTelefono ||
    !contactoEmail
  ) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 },
    );
  }

  const carga = await db.carga.create({
    data: {
      titulo,
      origen,
      destino,
      tipoCarga,
      peso: peso ? parseFloat(peso) : null,
      volumen: volumen ? parseFloat(volumen as string) : null,
      presupuesto: presupuesto ? parseFloat(presupuesto as string) : null,
      fechaCarga: new Date(fechaCarga),
      fechaEntrega: fechaEntrega ? new Date(fechaEntrega as string) : null,
      tiempoEstimado: (tiempoEstimado as string) || null,
      descripcion: (descripcion as string) || null,
      contactoNombre,
      contactoTelefono,
      contactoEmail,
      empresaId: session.userId,
      estado: "PENDIENTE_PAGO",
    },
  });

  const fee = parseFloat(process.env.MP_PRECIO_PUBLICACION ?? "500");
  const origin = new URL(req.url).origin;

  const preference = await crearPreferencia({
    items: [
      {
        id: carga.id.toString(),
        title: `Publicación de carga: ${carga.titulo}`,
        quantity: 1,
        unit_price: fee,
        currency_id: "ARS",
      },
    ],
    external_reference: `publicar_${carga.id}`,
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
    await db.carga.delete({ where: { id: carga.id } });
    return NextResponse.json(
      { error: "Error al crear preferencia de pago" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url }, { status: 201 });
}
