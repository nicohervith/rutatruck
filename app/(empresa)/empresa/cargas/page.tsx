import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBellEmpresa from "../_components/NotificacionBellEmpresa";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";
import FiltroEstado from "@/app/_components/FiltroEstado";

type EstadoConfig = {
  label: string;
  color: string;
  dot: string;
};

const ESTADO_CONFIG: Record<string, EstadoConfig> = {
  PENDIENTE_PAGO: {
    label: "Pago pendiente",
    color: "bg-yellow-500/20 text-yellow-300",
    dot: "bg-yellow-400",
  },
  ACTIVA: {
    label: "Activa",
    color: "bg-green-500/20 text-green-300",
    dot: "bg-green-400",
  },
  PENDIENTE_PAGO_TRANSPORTISTA: {
    label: "Esperando pago",
    color: "bg-yellow-500/20 text-yellow-300",
    dot: "bg-yellow-400",
  },
  ASIGNADA: {
    label: "En viaje",
    color: "bg-blue-500/20 text-blue-300",
    dot: "bg-blue-400",
  },
  EN_CONFIRMACION: {
    label: "Confirmar completado",
    color: "bg-orange-500/20 text-orange-300",
    dot: "bg-orange-400",
  },
  FINALIZADA: {
    label: "Finalizada",
    color: "bg-white/10 text-gray-400",
    dot: "bg-gray-600",
  },
  CANCELADA: {
    label: "Cancelada",
    color: "bg-red-500/20 text-red-300",
    dot: "bg-red-400",
  },
  DISPUTA: {
    label: "En disputa",
    color: "bg-purple-500/20 text-purple-300",
    dot: "bg-purple-400",
  },
};

export default async function CargasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string; estado?: string }>;
}) {
  const session = await verifySession();
  const { success, error, estado: estadoFiltro = "" } = await searchParams;

  const cargas = await db.carga.findMany({
    where: { empresaId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { postulaciones: { where: { estado: "PENDIENTE" } } } },
    },
  });

  const enConfirmacion = cargas.filter((c) => c.estado === "EN_CONFIRMACION");
  const resto = cargas.filter((c) => c.estado !== "EN_CONFIRMACION");
  const sorted = [...enConfirmacion, ...resto];

  const estadosCounts = cargas.reduce((acc, c) => {
    acc[c.estado] = (acc[c.estado] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filterOpciones = [
    { value: "", label: "Todas", count: cargas.length },
    ...Object.entries(estadosCounts).map(([estado, count]) => ({
      value: estado,
      label: ESTADO_CONFIG[estado]?.label ?? estado,
      count,
    })),
  ];

  const visible = estadoFiltro ? sorted.filter((c) => c.estado === estadoFiltro) : sorted;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <Link href="/empresa/dashboard">
          <LogoClickCargo />
        </Link>
        <div className="flex items-center gap-2">
          <NotificacionBellEmpresa />
          <HamburgerMenu role="empresa" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link
            href="/empresa/dashboard"
            className="text-sm font-medium inline-flex items-center gap-1 mb-3 transition-colors"
            style={{ color: "#2DD4BF" }}
          >
            ← Panel
          </Link>
          <h1 className="text-2xl font-bold text-white">Mis cargas</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {cargas.length} carga{cargas.length !== 1 ? "s" : ""} publicada{cargas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {cargas.length > 0 && (
          <div className="mb-5">
            <FiltroEstado opciones={filterOpciones} current={estadoFiltro} />
          </div>
        )}

        {success === "1" && (
          <div
            className="mb-6 rounded-xl px-4 py-3 flex items-center gap-3 border"
            style={{ backgroundColor: "#2DD4BF1A", borderColor: "#2DD4BF33" }}
          >
            <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#2DD4BF" }}>
              ¡Carga publicada exitosamente! Los transportistas ya pueden verla.
            </p>
          </div>
        )}

        {error === "pago" && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-sm text-red-300">
              Hubo un problema al procesar el pago. Si fue debitado, contactá a soporte.
            </p>
          </div>
        )}

        {cargas.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
          >
            <p className="mb-6" style={{ color: "#6B7280" }}>Todavía no publicaste cargas</p>
            <Link
              href="/empresa/cargas/nueva"
              className="inline-flex items-center gap-2 font-semibold rounded-xl px-6 py-3.5 transition-opacity hover:opacity-90 text-sm"
              style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Publicar primera carga
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.length === 0 && (
              <div className="rounded-xl border p-10 text-center" style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}>
                <p className="text-sm" style={{ color: "#6B7280" }}>No hay cargas con ese estado.</p>
              </div>
            )}
            {visible.map((carga: any) => {
              const cfg = ESTADO_CONFIG[carga.estado] ?? {
                label: carga.estado,
                color: "bg-white/10 text-gray-400",
                dot: "bg-gray-600",
              };
              const pendientes = carga._count.postulaciones;
              const needsAction = carga.estado === "EN_CONFIRMACION";

              return (
                <Link
                  key={carga.id}
                  href={`/empresa/cargas/${carga.id}`}
                  className={`rounded-xl border block overflow-hidden transition-all hover:border-[#2DD4BF55] ${needsAction ? "ring-1 ring-orange-500/40" : ""}`}
                  style={{ backgroundColor: "#112424", borderColor: needsAction ? "#FB923C55" : "#1E3838" }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <h3 className="font-semibold text-white truncate">{carga.titulo}</h3>
                        </div>
                        <p className="text-sm ml-4" style={{ color: "#6B7280" }}>
                          {carga.origen} → {carga.destino}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 ml-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "#4B5563" }}>Tipo</p>
                        <p className="text-sm font-semibold text-white">{carga.tipoCarga}</p>
                      </div>
                      {carga.peso !== null && (
                        <div>
                          <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "#4B5563" }}>Toneladas</p>
                          <p className="text-sm font-semibold text-white">{carga.peso} tn</p>
                        </div>
                      )}
                      {carga.presupuesto !== null && (
                        <div>
                          <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "#4B5563" }}>Precio</p>
                          <p className="text-sm font-bold" style={{ color: "#2DD4BF" }}>
                            ${carga.presupuesto.toLocaleString("es-AR")}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "#4B5563" }}>Fecha</p>
                        <p className="text-sm font-semibold text-white">{carga.fechaCarga.toLocaleDateString("es-AR")}</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="px-5 py-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
                    style={
                      needsAction
                        ? { backgroundColor: "#FB923C", color: "#fff" }
                        : pendientes > 0
                        ? { backgroundColor: "#2DD4BF", color: "#0C1E1E" }
                        : { backgroundColor: "#1A3030", color: "#9CA3AF" }
                    }
                  >
                    {needsAction ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Confirmar viaje completado
                      </>
                    ) : pendientes > 0 ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ver {pendientes} postulaci{pendientes === 1 ? "ón" : "ones"}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver carga
                      </>
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
