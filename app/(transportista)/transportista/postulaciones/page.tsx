import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import Image from "next/image";
import logoImage from "@/app/assets/Logo.jpeg";
import NotificacionBell from "../_components/NotificacionBell";
import MarkNotificacionesVistas from "../_components/MarkNotificacionesVistas";

type CargaEstadoConfig = {
  label: string;
  color: string;
  border: string;
  dot: string;
};

const CARGA_ESTADO_CONFIG: Record<string, CargaEstadoConfig> = {
  ASIGNADA: {
    label: "En viaje",
    color: "bg-blue-100 text-blue-800",
    border: "border-l-blue-400",
    dot: "bg-blue-400",
  },
  EN_CONFIRMACION: {
    label: "Esperando confirmación",
    color: "bg-orange-100 text-orange-800",
    border: "border-l-orange-400",
    dot: "bg-orange-400",
  },
  FINALIZADA: {
    label: "Viaje completado",
    color: "bg-green-100 text-green-800",
    border: "border-l-green-400",
    dot: "bg-green-400",
  },
  DISPUTA: {
    label: "En disputa",
    color: "bg-purple-100 text-purple-800",
    border: "border-l-purple-400",
    dot: "bg-purple-400",
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

export default async function MisPostulacionesPage() {
  const session = await verifySession();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <MarkNotificacionesVistas />
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/transportista/dashboard">
          <Image src={logoImage} alt="ClickCargo" width={120} height={40} />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/transportista/cargas"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Ver cargas
          </Link>
          <NotificacionBell />
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Mis postulaciones
          </h1>
        </div>

        {postulaciones.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400 mb-4">
              Todavía no te postulaste a ninguna carga
            </p>
            <Link
              href="/transportista/cargas"
              className="bg-brand-navy hover:bg-brand-navy-dark text-white font-medium rounded-lg px-6 py-2.5 transition-colors inline-block"
            >
              Ver cargas disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((p: any) => {
              const esAceptada = p.estado === "ACEPTADA";
              const esRechazada = p.estado === "RECHAZADA";
              const esNueva = esAceptada && !p.vistaTransportista;
              const cargaCfg = CARGA_ESTADO_CONFIG[p.carga.estado];

              const borderClass = esAceptada && cargaCfg
                ? `border-l-4 ${cargaCfg.border}`
                : esNueva
                ? "border-green-300 ring-1 ring-green-200"
                : "border-gray-100";

              return (
                <Link
                  key={p.id}
                  href={`/transportista/cargas/${p.carga.id}`}
                  className={`bg-white rounded-xl border p-5 flex items-start justify-between gap-4 hover:shadow-sm transition-all block ${borderClass} ${esRechazada ? "opacity-55" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {esNueva && (
                        <span className="flex h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                      )}
                      {esAceptada && cargaCfg && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cargaCfg.dot}`} />
                      )}
                      <h3 className="font-medium text-gray-800 truncate">
                        {p.carga.titulo}
                      </h3>
                      {esAceptada && cargaCfg ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${cargaCfg.color}`}>
                          {cargaCfg.label}
                        </span>
                      ) : (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          esRechazada
                            ? "bg-gray-100 text-gray-500"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {esRechazada ? "No seleccionado" : "Pendiente"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 ml-4">
                      {p.carga.origen} → {p.carga.destino}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 ml-4">
                      {p.carga.fechaCarga.toLocaleDateString("es-AR")} ·{" "}
                      {p.carga.tipoCarga}
                      {p.carga.presupuesto !== null &&
                        ` · $${p.carga.presupuesto.toLocaleString("es-AR")}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {esNueva && (
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        ¡Nuevo!
                      </span>
                    )}
                    {esAceptada && p.carga.estado === "FINALIZADA" && (
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        ✓ Completado
                      </span>
                    )}
                    {esAceptada && p.carga.estado === "EN_CONFIRMACION" && (
                      <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
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
