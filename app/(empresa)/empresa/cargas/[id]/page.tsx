import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import SeleccionarButton from "./_components/SeleccionarButton";
import EditarCargaPanel from "./_components/EditarCargaPanel";
import ConfirmarCompletadoButton from "./_components/ConfirmarCompletadoButton";
import AbrirDisputaEmpresaButton from "./_components/AbrirDisputaEmpresaButton";
import ReintentarPagoButton from "./_components/ReintentarPagoButton";
import CancelarCargaButton from "./_components/CancelarCargaButton";
import NotificacionBellEmpresa from "../../_components/NotificacionBellEmpresa";
import { AutoRefresh } from "@/app/_components/AutoRefresh";
import LogoClickCargo from "@/app/_components/LogoClickCargo";

function formatWhatsApp(phone: string): string {
  return phone.replace(/\D/g, "");
}

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE_PAGO: { label: "Pago pendiente", color: "bg-yellow-500/20 text-yellow-300" },
  ACTIVA: { label: "Activa", color: "bg-green-500/20 text-green-300" },
  PENDIENTE_PAGO_TRANSPORTISTA: { label: "Esperando pago", color: "bg-yellow-500/20 text-yellow-300" },
  ASIGNADA: { label: "Asignada", color: "bg-blue-500/20 text-blue-300" },
  EN_CONFIRMACION: { label: "Esperando confirmación", color: "bg-orange-500/20 text-orange-300" },
  FINALIZADA: { label: "Finalizada", color: "bg-white/10 text-gray-400" },
  CANCELADA: { label: "Cancelada", color: "bg-red-500/20 text-red-300" },
  DISPUTA: { label: "En disputa", color: "bg-purple-500/20 text-purple-300" },
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
    color: "bg-white/10 text-gray-400",
  };

  const puedeEditar = carga.estado === "ACTIVA";
  const puedeCancelar = carga.estado === "ACTIVA";
  const pendientePago = carga.estado === "PENDIENTE_PAGO";
  const puedeConfirmar = carga.estado === "EN_CONFIRMACION";
  const puedeDisputa = carga.estado === "ASIGNADA" || carga.estado === "EN_CONFIRMACION";
  const esperandoPagoTransportista = carga.estado === "PENDIENTE_PAGO_TRANSPORTISTA";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F5F5" }}>
      <AutoRefresh url={`/api/cargas/${carga.id}/estado`} />
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#E2E8E8" }}
      >
        <Link href="/empresa/dashboard">
          <LogoClickCargo />
        </Link>
        <NotificacionBellEmpresa />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link
            href="/empresa/cargas"
            className="inline-flex items-center gap-2 mb-4 font-semibold text-sm transition-colors hover:opacity-80"
            style={{ color: "var(--primary)" }}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full border-2" style={{ borderColor: "var(--primary)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            Mis cargas
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-gray-900">{carga.titulo}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estado.color}`}>
              {estado.label}
            </span>
          </div>
          <p className="mt-1.5 text-base" style={{ color: "#374151" }}>
            {carga.origen} <span style={{ color: "var(--primary)" }}>→</span> {carga.destino}
          </p>
        </div>

        {error === "pago_cancelado" && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
            <p className="text-sm text-yellow-300">
              El pago fue cancelado. Podés intentarlo nuevamente.
            </p>
          </div>
        )}

        {(pendientePago || puedeCancelar || puedeEditar || puedeConfirmar || puedeDisputa) && (
          <div
            className="rounded-xl border p-5 mb-6"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
          >
            <h2 className="font-medium text-gray-900 mb-4">Acciones</h2>
            <div className="flex flex-wrap gap-3">
              {pendientePago && (
                <>
                  <ReintentarPagoButton cargaId={carga.id} />
                  <CancelarCargaButton cargaId={carga.id} />
                </>
              )}
              {(puedeEditar || puedeCancelar) && (
                <EditarCargaPanel
                  sinTransportista={carga.transportistaAsignadoId === null}
                  carga={{
                    id: carga.id,
                    titulo: carga.titulo,
                    origen: carga.origen,
                    destino: carga.destino,
                    tipoCarga: carga.tipoCarga,
                    tipoCargaDetalle: carga.tipoCargaDetalle ?? null,
                    peso: carga.peso,
                    volumen: carga.volumen,
                    presupuesto: carga.presupuesto,
                    fechaCarga: toDateInput(carga.fechaCarga),
                    fechaCupo: toDateInput(carga.fechaCupo),
                    preferenciaCamion: carga.preferenciaCamion,
                    descripcion: carga.descripcion,
                    contactoNombre: carga.contactoNombre,
                    contactoTelefono: carga.contactoTelefono,
                    contactoEmail: carga.contactoEmail,
                  }}
                />
              )}
              {puedeConfirmar && <ConfirmarCompletadoButton cargaId={carga.id} />}
            </div>
            {puedeDisputa && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "#E2E8E8" }}>
                <p className="text-xs mb-2" style={{ color: "#6B7280" }}>¿Hubo un problema con el viaje?</p>
                <AbrirDisputaEmpresaButton cargaId={carga.id} />
              </div>
            )}
          </div>
        )}

        {esperandoPagoTransportista && carga.transportistaAsignado && carga.transportistaPagoDeadline && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
            <p className="text-sm text-yellow-300 font-medium mb-1">
              Esperando pago de comisión
            </p>
            <p className="text-sm text-yellow-200">
              <strong>{carga.transportistaAsignado.name}</strong> tiene hasta las{" "}
              {carga.transportistaPagoDeadline.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} del{" "}
              {carga.transportistaPagoDeadline.toLocaleDateString("es-AR")} para pagar la comisión y activar el viaje.
              Si no paga, la carga vuelve a estar disponible.
            </p>
          </div>
        )}

        {carga.estado === "EN_CONFIRMACION" && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3">
            <p className="text-sm text-orange-300 font-medium">
              El transportista marcó el viaje como completado. ¿Podés confirmarlo?
            </p>
          </div>
        )}

        {carga.estado === "DISPUTA" && carga.disputaDescripcion && (
          <div className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3">
            <p className="text-sm text-purple-300 font-medium mb-1">
              Disputa abierta por {carga.disputaAbiertaPor === "EMPRESA" ? "vos" : "el transportista"}
            </p>
            <p className="text-sm text-purple-200">{carga.disputaDescripcion}</p>
          </div>
        )}

        <div
          className="rounded-xl border p-6 mb-6"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
        >
          <h2 className="font-medium text-gray-900 mb-4">Datos de la carga</h2>
          <div className="space-y-2">
            {[
              ["Tipo de carga", carga.tipoCarga],
              carga.tipoCargaDetalle ? ["Especificación", carga.tipoCargaDetalle] : null,
              carga.peso !== null ? ["Peso", `${carga.peso} toneladas`] : null,
              carga.presupuesto !== null
                ? ["Presupuesto", `$${carga.presupuesto.toLocaleString("es-AR")}`]
                : null,
              ["Fecha de carga", carga.fechaCarga.toLocaleDateString("es-AR")],
              carga.fechaCupo
                ? ["Fecha de cupo", carga.fechaCupo.toLocaleDateString("es-AR")]
                : null,
              carga.preferenciaCamion ? ["Preferencia de camión", carga.preferenciaCamion] : null,
              carga.descripcion ? ["Descripción", carga.descripcion] : null,
            ]
              .filter((item): item is string[] => Array.isArray(item))
              .map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between py-1.5 border-b last:border-0"
                  style={{ borderColor: "#E2E8E8" }}
                >
                  <span className="text-sm" style={{ color: "#374151" }}>{label}</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
                </div>
              ))}
          </div>
        </div>

        {carga.transportistaAsignado && (
          <div
            className="rounded-xl border p-6 mb-6"
            style={{ backgroundColor: "#FFFFFF", borderColor: "var(--primary-20)" }}
          >
            <h2 className="font-medium text-gray-900 mb-3">Transportista asignado</h2>
            <p className="font-medium text-gray-900">{carga.transportistaAsignado.name}</p>
            <p className="text-sm mt-0.5" style={{ color: "#374151" }}>{carga.transportistaAsignado.email}</p>
            {carga.transportistaAsignado.phone && (
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href={`tel:${carga.transportistaAsignado.phone}`}
                  className="inline-flex items-center gap-2 border text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                  style={{ borderColor: "var(--primary-20)", color: "var(--primary)", backgroundColor: "var(--primary-5)" }}
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
                  className="inline-flex items-center gap-2 bg-[#25D366] text-gray-900 text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#1ebe57] transition-colors"
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

        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
        >
          <h2 className="font-medium text-gray-900 mb-4">
            Postulaciones
            {carga.postulaciones.length > 0 && (
              <span className="ml-2 text-sm font-normal" style={{ color: "#6B7280" }}>
                ({carga.postulaciones.length})
              </span>
            )}
          </h2>

          {carga.postulaciones.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "#6B7280" }}>
              Todavía no hay postulaciones para esta carga.
            </p>
          ) : (
            <div className="space-y-4">
              {carga.postulaciones.map((p: any) => (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 ${
                    p.estado === "RECHAZADA" ? "opacity-50" : ""
                  }`}
                  style={{
                    borderColor: p.estado === "ACEPTADA" ? "var(--primary-20)" : "#1E3838",
                    backgroundColor: p.estado === "ACEPTADA" ? "var(--primary-5)" : "#0F2020",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{p.transportista.name}</p>
                      <p className="text-sm" style={{ color: "#374151" }}>
                        {p.contactoEmail ?? p.transportista.email}
                      </p>
                      {(p.contactoTelefono ?? p.transportista.phone) && (
                        <p className="text-sm" style={{ color: "#374151" }}>
                          {p.contactoTelefono ?? p.transportista.phone}
                        </p>
                      )}
                      {p.mensaje && (
                        <p className="text-sm mt-2 italic" style={{ color: "#9CA3AF" }}>
                          "{p.mensaje}"
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                        Postulado el {p.createdAt.toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {p.estado === "ACEPTADA" && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--primary-13)] text-[var(--primary)]">
                          Seleccionado
                        </span>
                      )}
                      {p.estado === "RECHAZADA" && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-gray-400">
                          No seleccionado
                        </span>
                      )}
                      {p.estado === "PENDIENTE" && carga.estado === "ACTIVA" && (
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
