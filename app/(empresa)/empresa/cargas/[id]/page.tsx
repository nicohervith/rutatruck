import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import SeleccionarButton from "./_components/SeleccionarButton";
import CancelarCargaButton from "./_components/CancelarCargaButton";
import EditarCargaPanel from "./_components/EditarCargaPanel";
import ConfirmarCompletadoButton from "./_components/ConfirmarCompletadoButton";
import AbrirDisputaEmpresaButton from "./_components/AbrirDisputaEmpresaButton";
import Image from "next/image";
import logoImage from "@/app/assets/Logo.jpeg";

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
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/empresa/dashboard">
          <Image src={logoImage} alt="ClickCargo" width={120} height={40} />
        </Link>
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
            <p className="text-sm text-gray-600">
              {carga.transportistaAsignado.email}
            </p>
            {carga.transportistaAsignado.phone && (
              <p className="text-sm text-gray-600">
                {carga.transportistaAsignado.phone}
              </p>
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
