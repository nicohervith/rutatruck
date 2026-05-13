import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBell from "../_components/NotificacionBell";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";
import MarkNotificacionesVistas from "../_components/MarkNotificacionesVistas";
import { AutoRefresh } from "@/app/_components/AutoRefresh";
import FiltroEstado from "@/app/_components/FiltroEstado";

type CargaEstadoConfig = {
  label: string;
  color: string;
  dot: string;
  borderLeftColor: string;
};

const CARGA_ESTADO_CONFIG: Record<string, CargaEstadoConfig> = {
  PENDIENTE_PAGO_TRANSPORTISTA: {
    label: "Pagar comisión",
    color: "bg-yellow-500/20 text-yellow-300",
    dot: "bg-yellow-400",
    borderLeftColor: "#FCD34D",
  },
  ASIGNADA: {
    label: "En viaje",
    color: "bg-blue-500/20 text-blue-300",
    dot: "bg-blue-400",
    borderLeftColor: "#60A5FA",
  },
  EN_CONFIRMACION: {
    label: "Esperando confirmación",
    color: "bg-orange-500/20 text-orange-300",
    dot: "bg-orange-400",
    borderLeftColor: "#FB923C",
  },
  FINALIZADA: {
    label: "Viaje completado",
    color: "bg-green-500/20 text-green-300",
    dot: "bg-green-400",
    borderLeftColor: "#4ADE80",
  },
  DISPUTA: {
    label: "En disputa",
    color: "bg-purple-500/20 text-purple-300",
    dot: "bg-purple-400",
    borderLeftColor: "#C084FC",
  },
};

const SORT_ORDER: Record<string, number> = {
  EN_CONFIRMACION: 0,
  DISPUTA: 1,
  ASIGNADA: 2,
  ACTIVA: 3,
  PENDIENTE_PAGO: 4,
  FINALIZADA: 5,
  CANCELADA: 6,
};

const FILTER_OPCIONES = [
  { value: "", label: "Todas", color: undefined },
  { value: "PAGAR", label: "Pagar comisión", color: "#FCD34D" },
  { value: "ASIGNADA", label: "En viaje", color: "#60A5FA" },
  { value: "EN_CONFIRMACION", label: "Aguardando conf.", color: "#FB923C" },
  { value: "FINALIZADA", label: "Completadas", color: "#4ADE80" },
  { value: "DISPUTA", label: "En disputa", color: "#C084FC" },
  { value: "PENDIENTE", label: "Sin respuesta", color: "#9CA3AF" },
  { value: "RECHAZADA", label: "No seleccionado", color: "#6B7280" },
];

function filtrarPostulaciones(postulaciones: any[], estado: string) {
  if (!estado) return postulaciones;
  if (estado === "PENDIENTE") return postulaciones.filter((p) => p.estado === "PENDIENTE");
  if (estado === "RECHAZADA") return postulaciones.filter((p) => p.estado === "RECHAZADA");
  if (estado === "PAGAR") return postulaciones.filter((p) => p.estado === "ACEPTADA" && p.carga.estado === "PENDIENTE_PAGO_TRANSPORTISTA");
  return postulaciones.filter((p) => p.estado === "ACEPTADA" && p.carga.estado === estado);
}

export default async function MisPostulacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const session = await verifySession();
  const { estado: estadoFiltro = "" } = await searchParams;

  const postulaciones = await db.postulacion.findMany({
    where: { transportistaId: session.userId },
    include: {
      carga: {
        select: {
          id: true,
          titulo: true,
          origen: true,
          destino: true,
          fechaCarga: true,
          tipoCarga: true,
          presupuesto: true,
          estado: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const sorted = [...postulaciones].sort((a: any, b: any) => {
    if (a.estado === "RECHAZADA" && b.estado !== "RECHAZADA") return 1;
    if (a.estado !== "RECHAZADA" && b.estado === "RECHAZADA") return -1;
    const orderA = SORT_ORDER[a.carga.estado] ?? 9;
    const orderB = SORT_ORDER[b.carga.estado] ?? 9;
    return orderA - orderB;
  });

  const opcionesConCount = FILTER_OPCIONES.map((op) => ({
    ...op,
    count: op.value === "" ? postulaciones.length : filtrarPostulaciones(sorted, op.value).length,
  })).filter((op) => op.value === "" || op.count > 0);

  const visible = filtrarPostulaciones(sorted, estadoFiltro);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <AutoRefresh url="/api/postulaciones/hash" />
      <MarkNotificacionesVistas />
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <Link href="/transportista/dashboard">
          <LogoClickCargo />
        </Link>
        <div className="flex items-center gap-2">
          <NotificacionBell />
          <HamburgerMenu role="transportista" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link
            href="/transportista/dashboard"
            className="inline-flex items-center gap-2 mb-4 font-semibold text-sm transition-colors hover:opacity-80"
            style={{ color: "#2DD4BF" }}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full border-2" style={{ borderColor: "#2DD4BF" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            Volver al panel
          </Link>
          <h1 className="text-3xl font-bold text-white">Mis postulaciones</h1>
        </div>

        {postulaciones.length > 0 && (
          <div className="mb-5">
            <FiltroEstado opciones={opcionesConCount} current={estadoFiltro} />
          </div>
        )}

        {postulaciones.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
          >
            <p className="mb-4" style={{ color: "#A8C5C5" }}>Todavía no te postulaste a ninguna carga</p>
            <Link
              href="/transportista/cargas"
              className="font-medium rounded-lg px-6 py-2.5 transition-colors inline-block text-sm"
              style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
            >
              Ver cargas disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.length === 0 && (
              <div className="rounded-xl border p-10 text-center" style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}>
                <p className="text-sm" style={{ color: "#A8C5C5" }}>No hay postulaciones con ese estado.</p>
              </div>
            )}
            {visible.map((p: any) => {
              const esAceptada = p.estado === "ACEPTADA";
              const esRechazada = p.estado === "RECHAZADA";
              const esNueva = esAceptada && !p.vistaTransportista;
              const cargaCfg = CARGA_ESTADO_CONFIG[p.carga.estado];

              const cardStyle: React.CSSProperties = {
                backgroundColor:
                  esAceptada && cargaCfg
                    ? `${cargaCfg.borderLeftColor}18`
                    : "#112424",
                borderColor:
                  esAceptada && cargaCfg
                    ? `${cargaCfg.borderLeftColor}66`
                    : esNueva
                    ? "#2DD4BF33"
                    : "#1E3838",
              };

              return (
                <Link
                  key={p.id}
                  href={`/transportista/cargas/${p.carga.id}`}
                  className={`rounded-xl border p-5 flex items-start justify-between gap-4 hover:border-[#2DD4BF33] transition-all block ${esRechazada ? "opacity-50" : ""} ${esNueva ? "ring-1 ring-[#2DD4BF20]" : ""}`}
                  style={cardStyle}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {esNueva && (
                        <span className="flex h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#2DD4BF" }} />
                      )}
                      {esAceptada && cargaCfg && !esNueva && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cargaCfg.dot}`} />
                      )}
                      <h3 className="font-medium text-white truncate">{p.carga.titulo}</h3>
                      {esAceptada && cargaCfg ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cargaCfg.color}`}>
                          {cargaCfg.label}
                        </span>
                      ) : (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          esRechazada
                            ? "bg-white/10 text-gray-400"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}>
                          {esRechazada ? "No seleccionado" : "Pendiente"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm ml-4" style={{ color: "#A8C5C5" }}>
                      {p.carga.origen} → {p.carga.destino}
                    </p>
                    <p className="text-xs mt-1 ml-4" style={{ color: "#8BBDBD" }}>
                      {p.carga.fechaCarga.toLocaleDateString("es-AR")} · {p.carga.tipoCarga}
                      {p.carga.presupuesto !== null && ` · $${p.carga.presupuesto.toLocaleString("es-AR")}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {esNueva && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: "#2DD4BF", backgroundColor: "#2DD4BF1A" }}>
                        ¡Nuevo!
                      </span>
                    )}
                    {esAceptada && p.carga.estado === "FINALIZADA" && (
                      <span className="text-xs font-medium text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
                        ✓ Completado
                      </span>
                    )}
                    {esAceptada && p.carga.estado === "EN_CONFIRMACION" && (
                      <span className="text-xs font-medium text-orange-300 bg-orange-500/20 px-2 py-1 rounded-full">
                        Aguardando empresa
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
