import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { crearPreferencia } from "@/lib/mercadopago";
import { getPrecioPublicacion } from "@/lib/comision";

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
    fechaCupo,
    preferenciaCamion,
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

   let carga;
   try {
     carga = await db.carga.create({
       data: {
         titulo,
         origen,
         destino,
         tipoCarga,
         peso: peso ? parseFloat(peso) : null,
         volumen: volumen ? parseFloat(volumen) : null,
         presupuesto: presupuesto ? parseFloat(presupuesto) : null,
         fechaCarga: new Date(fechaCarga),
         fechaCupo: fechaCupo ? new Date(fechaCupo) : null,
         preferenciaCamion: preferenciaCamion || null,
         descripcion: descripcion || null,
         contactoNombre,
         contactoTelefono,
         contactoEmail,
         empresaId: session.userId,
         estado: "PENDIENTE_PAGO",
       },
     });
   } catch (err) {
     console.error("[POST /api/cargas] Error Prisma:", err);
     return NextResponse.json(
       { error: "Error al guardar la carga" },
       { status: 500 },
     );
   }

   const fee = await getPrecioPublicacion();
   const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;

   let preference;
   try {
     preference = await crearPreferencia({
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
   } catch (err) {
     console.error("[POST /api/cargas] Error MercadoPago:", err);
     await db.carga.delete({ where: { id: carga.id } }).catch(() => {});
     return NextResponse.json(
       { error: "Error al conectar con MercadoPago" },
       { status: 500 },
     );
   }

   const url =
     process.env.NODE_ENV === "production"
       ? preference.init_point
       : preference.sandbox_init_point;

   if (!url) {
     await db.carga.delete({ where: { id: carga.id } }).catch(() => {});
     return NextResponse.json(
       { error: "Error al crear preferencia de pago" },
       { status: 500 },
     );
   }

   return NextResponse.json({ url }, { status: 201 });
}
