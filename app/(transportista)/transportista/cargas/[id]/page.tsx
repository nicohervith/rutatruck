import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import Image from "next/image";
import logoImage from "@/app/assets/Logo5.jpeg";
import PostularseButton from "./_components/PostularseButton";
import CompletarViajeButton from "./_components/CompletarViajeButton";
import AbrirDisputaTransportistaButton from "./_components/AbrirDisputaTransportistaButton";

const TIPO_LABELS: Record<string, string> = {
  granos: "Granos",
  frutas: "Frutas",
  verduras: "Verduras",
  animales: "Animales",
  otro: "Otro",
};

function formatWhatsApp(phone: string): string {
  return phone.replace(/\D/g, "");
}

export default async function CargaPublicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;

  const cargaId = parseInt(id);
  if (isNaN(cargaId)) redirect("/transportista/cargas");

  const [carga, miPostulacion] = await Promise.all([
    db.carga.findUnique({ where: { id: cargaId } }),
    db.postulacion.findUnique({
      where: { cargaId_transportistaId: { cargaId, transportistaId: session.userId } },
    }),
  ]);

  if (!carga || carga.estado === "PENDIENTE_PAGO" || carga.estado === "CANCELADA") {
    redirect("/transportista/cargas");
  }

  const soyAsignado = carga.transportistaAsignadoId === session.userId;
  const soyAceptado = miPostulacion?.estado === "ACEPTADA";
  const waPhone = formatWhatsApp(carga.contactoTelefono);
  const waMsg = encodeURIComponent(
    `Hola ${carga.contactoNombre}, soy el transportista seleccionado para la carga "${carga.titulo}". Me comunico para coordinar los detalles.`,
  );

  const puedeCompletar = soyAsignado && carga.estado === "ASIGNADA";
  const puedeDisputa = soyAsignado && (carga.estado === "ASIGNADA" || carga.estado === "EN_CONFIRMACION");
  const esperandoConfirmacion = soyAsignado && carga.estado === "EN_CONFIRMACION";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-6 py-4 border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <Link href="/transportista/dashboard">
          <Image src={logoImage} alt="ClickCargo" width={48} height={48} className="rounded-xl" />
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link
            href="/transportista/cargas"
            className="text-sm inline-block mb-3 transition-colors"
            style={{ color: "#6B7280" }}
          >
            ← Cargas disponibles
          </Link>
          <h1 className="text-2xl font-semibold text-white">{carga.titulo}</h1>
          <p className="mt-1" style={{ color: "#6B7280" }}>
            {carga.origen} → {carga.destino}
          </p>
        </div>

        <div
          className="rounded-xl border p-6 mb-6"
          style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
        >
          <h2 className="font-medium text-white mb-4">Detalles de la carga</h2>
          <div className="space-y-2">
            {[
              ["Tipo", TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga],
              carga.peso !== null ? ["Peso", `${carga.peso} toneladas`] : null,
              carga.volumen !== null ? ["Volumen", `${carga.volumen} m³`] : null,
              carga.presupuesto !== null
                ? ["Presupuesto", `$${carga.presupuesto.toLocaleString("es-AR")}`]
                : null,
              ["Fecha de carga", carga.fechaCarga.toLocaleDateString("es-AR")],
              carga.fechaEntrega
                ? ["Fecha de entrega", carga.fechaEntrega.toLocaleDateString("es-AR")]
                : null,
              carga.tiempoEstimado ? ["Tiempo estimado", carga.tiempoEstimado] : null,
              carga.descripcion ? ["Descripción", carga.descripcion] : null,
            ]
              .filter((item): item is string[] => Array.isArray(item))
              .map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between py-1.5 border-b last:border-0"
                  style={{ borderColor: "#1E3838" }}
                >
                  <span className="text-sm" style={{ color: "#6B7280" }}>{label}</span>
                  <span className="text-sm font-medium text-white text-right max-w-[60%]">{value}</span>
                </div>
              ))}
          </div>
        </div>

        {soyAceptado && (
          <div
            className="rounded-xl border p-6 mb-6"
            style={{ backgroundColor: "#2DD4BF0D", borderColor: "#2DD4BF33" }}
          >
            <h2 className="font-medium mb-4" style={{ color: "#2DD4BF" }}>
              Datos de contacto de la empresa
            </h2>
            <p className="font-medium text-white">{carga.contactoNombre}</p>
            <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{carga.contactoEmail}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href={`tel:${carga.contactoTelefono}`}
                className="inline-flex items-center gap-2 border text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                style={{ borderColor: "#2DD4BF33", color: "#2DD4BF", backgroundColor: "#2DD4BF0D" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Llamar ({carga.contactoTelefono})
              </a>
              <a
                href={`https://wa.me/${waPhone}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#1ebe57] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.559 4.126 1.532 5.859L.053 23.447a.5.5 0 00.614.614l5.592-1.479A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.012-1.373l-.36-.213-3.723.984.984-3.723-.213-.36A9.818 9.818 0 1112 21.818z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        )}

        {(puedeCompletar || puedeDisputa || esperandoConfirmacion) && (
          <div className="space-y-3 mb-6">
            {esperandoConfirmacion && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3">
                <p className="text-sm text-orange-300 font-medium">
                  Marcaste este viaje como completado. Esperando confirmación de la empresa.
                </p>
              </div>
            )}
            {puedeCompletar && <CompletarViajeButton cargaId={carga.id} />}
            {puedeDisputa && <AbrirDisputaTransportistaButton cargaId={carga.id} />}
          </div>
        )}

        {soyAsignado && carga.estado === "FINALIZADA" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-green-300 font-medium">
              Viaje completado y confirmado por la empresa.
            </p>
          </div>
        )}

        {soyAsignado && carga.estado === "DISPUTA" && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-purple-300 font-medium mb-1">Disputa abierta</p>
            {carga.disputaDescripcion && (
              <p className="text-sm text-purple-200">{carga.disputaDescripcion}</p>
            )}
          </div>
        )}

        <PostularseButton cargaId={carga.id} miPostulacion={miPostulacion} />
      </main>
    </div>
  );
}
