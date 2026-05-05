import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import Image from "next/image";
import logoImage from "@/app/assets/Logo5.jpeg";
import NotificacionBellEmpresa from "../_components/NotificacionBellEmpresa";

type EstadoConfig = {
  label: string;
  color: string;
  border: string;
  dot: string;
};

const ESTADO_CONFIG: Record<string, EstadoConfig> = {
  PENDIENTE_PAGO: {
    label: "Pago pendiente",
    color: "bg-yellow-500/20 text-yellow-300",
    border: "border-l-yellow-400",
    dot: "bg-yellow-400",
  },
  ACTIVA: {
    label: "Activa",
    color: "bg-green-500/20 text-green-300",
    border: "border-l-green-400",
    dot: "bg-green-400",
  },
  ASIGNADA: {
    label: "Asignada",
    color: "bg-blue-500/20 text-blue-300",
    border: "border-l-blue-400",
    dot: "bg-blue-400",
  },
  EN_CONFIRMACION: {
    label: "Confirmar completado",
    color: "bg-orange-500/20 text-orange-300",
    border: "border-l-orange-400",
    dot: "bg-orange-400",
  },
  FINALIZADA: {
    label: "Finalizada",
    color: "bg-white/10 text-gray-400",
    border: "border-l-gray-600",
    dot: "bg-gray-600",
  },
  CANCELADA: {
    label: "Cancelada",
    color: "bg-red-500/20 text-red-300",
    border: "border-l-red-400",
    dot: "bg-red-400",
  },
  DISPUTA: {
    label: "En disputa",
    color: "bg-purple-500/20 text-purple-300",
    border: "border-l-purple-400",
    dot: "bg-purple-400",
  },
};

export default async function CargasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await verifySession();
  const { success, error } = await searchParams;

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <Link href="/empresa/dashboard">
          <Image src={logoImage} alt="ClickCargo" width={48} height={48} className="rounded-xl" />
        </Link>
        <div className="flex items-center gap-4">
          <NotificacionBellEmpresa />
          <Link
            href="/empresa/cargas/nueva"
            className="text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
          >
            + Nueva carga
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm transition-colors cursor-pointer"
              style={{ color: "#6B7280" }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Mis cargas</h1>
        </div>

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
            <p className="mb-4" style={{ color: "#6B7280" }}>Todavía no publicaste cargas</p>
            <Link
              href="/empresa/cargas/nueva"
              className="font-medium rounded-lg px-6 py-2.5 transition-colors inline-block text-sm"
              style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
            >
              Publicar primera carga
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((carga: any) => {
              const cfg = ESTADO_CONFIG[carga.estado] ?? {
                label: carga.estado,
                color: "bg-white/10 text-gray-400",
                border: "border-l-gray-600",
                dot: "bg-gray-600",
              };
              const postulacionesPendientes = carga._count.postulaciones;
              const needsAction = carga.estado === "EN_CONFIRMACION";
              return (
                <Link
                  key={carga.id}
                  href={`/empresa/cargas/${carga.id}`}
                  className={`rounded-xl border border-l-4 ${cfg.border} p-5 flex items-start justify-between gap-4 hover:border-[#2DD4BF33] transition-all block ${needsAction ? "ring-1 ring-orange-500/30" : ""}`}
                  style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <h3 className="font-medium text-white truncate">{carga.titulo}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm ml-4" style={{ color: "#6B7280" }}>
                      {carga.origen} → {carga.destino}
                    </p>
                    <p className="text-xs mt-1 ml-4" style={{ color: "#4B5563" }}>
                      {carga.fechaCarga.toLocaleDateString("es-AR")} · {carga.tipoCarga}
                      {carga.peso !== null && ` · ${carga.peso}t`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {needsAction && (
                      <span className="text-xs font-medium bg-orange-500/80 text-white rounded-lg px-3 py-1.5">
                        Acción requerida
                      </span>
                    )}
                    {postulacionesPendientes > 0 && !needsAction && (
                      <span className="text-sm bg-orange-500/20 text-orange-300 font-medium rounded-lg px-3 py-1.5">
                        {postulacionesPendientes} postulaci{postulacionesPendientes === 1 ? "ón" : "ones"}
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
