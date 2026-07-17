import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { isEmpresa } from "@/lib/roles";
import { publicarCargaFreeTier, publicarCargaConPago } from "@/lib/services/carga.service";

const FREE_TIER = process.env.FREE_TIER === "true";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isEmpresa(session.role)) {
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
    origenLat,
    origenLng,
    destino,
    destinoLat,
    destinoLng,
    tipoCarga,
    tipoCargaDetalle,
    peso,
    pesoUnidad,
    volumen,
    cantidadCamiones,
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

  const cargaData = {
    titulo,
    origen,
    origenLat: origenLat ? parseFloat(origenLat as string) : null,
    origenLng: origenLng ? parseFloat(origenLng as string) : null,
    destino,
    destinoLat: destinoLat ? parseFloat(destinoLat as string) : null,
    destinoLng: destinoLng ? parseFloat(destinoLng as string) : null,
    tipoCarga,
    tipoCargaDetalle: tipoCargaDetalle || null,
    peso: peso ? parseFloat(peso) : null,
    pesoUnidad: pesoUnidad || null,
    volumen: volumen ? parseFloat(volumen) : null,
    cantidadCamiones: cantidadCamiones ? Math.max(1, parseInt(cantidadCamiones)) : 1,
    presupuesto: presupuesto ? parseFloat(presupuesto) : null,
    fechaCarga: new Date(fechaCarga),
    fechaCupo: fechaCupo ? new Date(fechaCupo) : null,
    preferenciaCamion: preferenciaCamion || null,
    descripcion: descripcion || null,
    contactoNombre,
    contactoTelefono,
    contactoEmail,
    empresaId: session.userId,
  };

  if (FREE_TIER) {
    const result = await publicarCargaFreeTier(cargaData);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ cargaId: result.cargaId }, { status: 201 });
  }

  const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
  const result = await publicarCargaConPago(cargaData, origin);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ url: result.url }, { status: 201 });
}
