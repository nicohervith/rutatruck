import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  ACEPTADA: { label: "Seleccionado", color: "bg-green-100 text-green-800" },
  RECHAZADA: { label: "No seleccionado", color: "bg-gray-100 text-gray-600" },
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link
          href="/transportista/dashboard"
          className="text-xl font-bold text-green-700"
        >
          RutaTruck
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/transportista/cargas"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Ver cargas
          </Link>
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
              className="bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg px-6 py-2.5 transition-colors inline-block"
            >
              Ver cargas disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {postulaciones.map((p: any) => {
              const estado = ESTADO_LABELS[p.estado] ?? {
                label: p.estado,
                color: "bg-gray-100 text-gray-600",
              };
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-800 truncate">
                        {p.carga.titulo}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${estado.color}`}
                      >
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {p.carga.origen} → {p.carga.destino}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.carga.fechaCarga.toLocaleDateString("es-AR")} ·{" "}
                      {p.carga.tipoCarga}
                      {p.carga.presupuesto !== null &&
                        ` · $${p.carga.presupuesto.toLocaleString("es-AR")}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
