import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import SeleccionarButton from "./_components/SeleccionarButton";
import CancelarCargaButton from "./_components/CancelarCargaButton";
import EditarCargaPanel from "./_components/EditarCargaPanel";
import ConfirmarCompletadoButton from "./_components/ConfirmarCompletadoButton";
import AbrirDisputaEmpresaButton from "./_components/AbrirDisputaEmpresaButton";
import NotificacionBellEmpresa from "../../_components/NotificacionBellEmpresa";
import Image from "next/image";
import logoImage from "@/app/assets/Logo.jpeg";

function formatWhatsApp(phone: string): string {
  return phone.replace(/\D/g, "");
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE_PAGO: { label: "Pago pendiente", color: "bg-yellow-100 text-yellow-800" },
  ACTIVA: { label: "Activa", color: "bg-green-100 text-green-800" },
  ASIGNADA: { label: "Asignada", color: "bg-blue-100 text-blue-800" },
  EN_CONFIRMACION: { label: "Esperando confirmación", color: "bg-orange-100 text-orange-800" },
  FINALIZADA: { label: "Finalizada", color: "bg-gray-100 text-gray-600" },
  CANCELADA: { label: "Cancelada", color: "bg-red-100 text-red-800" },
  DISPUTA: { label: "En disputa", color: "bg-purple-100 text-purple-800" },
};

function toDateInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export default async function CargaDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;
  const { error } = await searchParams;

  const cargaId = parseInt(id);
  if (isNaN(cargaId)) redirect("/empresa/cargas");

  const carga = await db.carga.findUnique({
    where: { id: cargaId, empresaId: session.userId },
    include: {
      postulaciones: {
        include: {
          transportista: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      transportistaAsignado: {
        select: { name: true, email: true, phone: true },
      },
    },
  });

  if (!carga) redirect("/empresa/cargas");

  const estado = ESTADO_LABELS[carga.estado] ?? {
    label: carga.estado,
    color: "bg-gray-100 text-gray-600",
  };

  const puedeEditar = carga.estado === "ACTIVA";
  const puedeCancelar = carga.estado === "ACTIVA";
  const puedeConfirmar = carga.estado === "EN_CONFIRMACION";
  const puedeDisputa = carga.estado === "ASIGNADA" || carga.estado === "EN_CONFIRMACION";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/empresa/dashboard">
          <Image src={logoImage} alt="ClickCargo" width={120} height={40} />
        </Link>
        <NotificacionBellEmpresa />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link
            href="/empresa/cargas"
            className="text-sm text-gray-500 hover:text-gray-700 inline-block mb-3"
          >
            ← Mis cargas
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-800">
              {carga.titulo}
            </h1>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${estado.color}`}
            >
              {estado.label}
            </span>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            {carga.origen} → {carga.destino}
          </p>
        </div>

        {error === "pago_cancelado" && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
            <p className="text-sm text-yellow-800">
              El pago fue cancelado. Podés intentarlo nuevamente.
            </p>
          </div>
        )}

        {/* Acciones disponibles */}
        {(puedeCancelar || puedeEditar || puedeConfirmar || puedeDisputa) && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <h2 className="font-medium text-gray-800 mb-4">Acciones</h2>
            <div className="flex flex-wrap gap-3">
              {puedeEditar && (
                <EditarCargaPanel
                  carga={{
                    id: carga.id,
                    titulo: carga.titulo,
                    origen: carga.origen,
                    destino: carga.destino,
                    tipoCarga: carga.tipoCarga,
                    peso: carga.peso,
                    volumen: carga.volumen,
                    fechaCarga: toDateInput(carga.fechaCarga),
                    fechaEntrega: toDateInput(carga.fechaEntrega),
                    tiempoEstimado: carga.tiempoEstimado,
                    descripcion: carga.descripcion,
                    contactoNombre: carga.contactoNombre,
                    contactoTelefono: carga.contactoTelefono,
                    contactoEmail: carga.contactoEmail,
                  }}
                />
              )}
              {puedeCancelar && <CancelarCargaButton cargaId={carga.id} />}
              {puedeConfirmar && <ConfirmarCompletadoButton cargaId={carga.id} />}
            </div>
            {puedeDisputa && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">¿Hubo un problema con el viaje?</p>
                <AbrirDisputaEmpresaButton cargaId={carga.id} />
              </div>
            )}
          </div>
        )}

        {/* Aviso de confirmación pendiente */}
        {carga.estado === "EN_CONFIRMACION" && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
            <p className="text-sm text-orange-800 font-medium">
              El transportista marcó el viaje como completado. ¿Podés confirmarlo?
            </p>
          </div>
        )}

        {/* Aviso de disputa */}
        {carga.estado === "DISPUTA" && carga.disputaDescripcion && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
            <p className="text-sm text-purple-800 font-medium mb-1">
              Disputa abierta por {carga.disputaAbiertaPor === "EMPRESA" ? "vos" : "el transportista"}
            </p>
            <p className="text-sm text-purple-700">{carga.disputaDescripcion}</p>
          </div>
        )}

        {/* Datos de la carga */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="font-medium text-gray-800 mb-4">Datos de la carga</h2>
          <div className="space-y-2">
            {[
              ["Tipo de carga", carga.tipoCarga],
              carga.peso !== null ? ["Peso", `${carga.peso} toneladas`] : null,
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
                  className="flex justify-between py-1.5 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">
                    {value}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Transportista asignado */}
        {carga.transportistaAsignado && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
            <h2 className="font-medium text-gray-800 mb-3">
              Transportista asignado
            </h2>
            <p className="font-medium text-gray-800">
              {carga.transportistaAsignado.name}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              {carga.transportistaAsignado.email}
            </p>
            {carga.transportistaAsignado.phone && (
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href={`tel:${carga.transportistaAsignado.phone}`}
                  className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-800 text-sm font-medium rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Llamar ({carga.transportistaAsignado.phone})
                </a>
                <a
                  href={`https://wa.me/${formatWhatsApp(carga.transportistaAsignado.phone)}?text=${encodeURIComponent(`Hola ${carga.transportistaAsignado.name}, soy la empresa responsable de la carga "${carga.titulo}". Me comunico para coordinar los detalles del transporte.`)}`}
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
            )}
          </div>
        )}

        {/* Postulaciones */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-medium text-gray-800 mb-4">
            Postulaciones
            {carga.postulaciones.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({carga.postulaciones.length})
              </span>
            )}
          </h2>

          {carga.postulaciones.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Todavía no hay postulaciones para esta carga.
            </p>
          ) : (
            <div className="space-y-4">
              {carga.postulaciones.map((p: any) => (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 ${
                    p.estado === "ACEPTADA"
                      ? "border-brand-border bg-brand-light"
                      : p.estado === "RECHAZADA"
                        ? "border-gray-100 bg-gray-50 opacity-60"
                        : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">
                        {p.transportista.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {p.transportista.email}
                      </p>
                      {p.transportista.phone && (
                        <p className="text-sm text-gray-500">
                          {p.transportista.phone}
                        </p>
                      )}
                      {p.mensaje && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{p.mensaje}"
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Postulado el {p.createdAt.toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {p.estado === "ACEPTADA" && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-light text-brand-navy">
                          Seleccionado
                        </span>
                      )}
                      {p.estado === "RECHAZADA" && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                          No seleccionado
                        </span>
                      )}
                      {p.estado === "PENDIENTE" &&
                        carga.estado === "ACTIVA" && (
                          <SeleccionarButton
                            cargaId={carga.id}
                            postulacionId={p.id}
                            transportistaNombre={p.transportista.name}
                          />
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
