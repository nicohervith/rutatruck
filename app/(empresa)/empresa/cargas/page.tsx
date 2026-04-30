import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVA: { label: "Activa", color: "bg-green-100 text-green-800" },
  ASIGNADA: { label: "Asignada", color: "bg-blue-100 text-blue-800" },
  FINALIZADA: { label: "Finalizada", color: "bg-gray-100 text-gray-600" },
  CANCELADA: { label: "Cancelada", color: "bg-red-100 text-red-800" },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/empresa/dashboard" className="text-xl font-bold text-green-700">
          RutaTruck
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/empresa/cargas/nueva"
            className="text-sm bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg px-4 py-2 transition-colors"
          >
            + Nueva carga
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
          <h1 className="text-2xl font-semibold text-gray-800">Mis cargas</h1>
        </div>

        {success === "1" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-800 font-medium">
              ¡Carga publicada exitosamente! Los transportistas ya pueden verla.
            </p>
          </div>
        )}

        {error === "pago" && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-800">
              Hubo un problema al procesar el pago. Si fue debitado, contactá a soporte.
            </p>
          </div>
        )}

        {cargas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400 mb-4">Todavía no publicaste cargas</p>
            <Link
              href="/empresa/cargas/nueva"
              className="bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg px-6 py-2.5 transition-colors inline-block"
            >
              Publicar primera carga
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cargas.map((carga) => {
              const estado = ESTADO_LABELS[carga.estado] ?? { label: carga.estado, color: "bg-gray-100 text-gray-600" };
              const postulacionesPendientes = carga._count.postulaciones;
              return (
                <Link
                  key={carga.id}
                  href={`/empresa/cargas/${carga.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex items-start justify-between gap-4 hover:border-gray-200 hover:shadow-sm transition-all block"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-800 truncate">
                        {carga.titulo}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${estado.color}`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {carga.origen} → {carga.destino}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {carga.fechaCarga.toLocaleDateString("es-AR")} · {carga.tipoCarga}
                      {carga.peso !== null && ` · ${carga.peso}t`}
                    </p>
                  </div>
                  {postulacionesPendientes > 0 && (
                    <span className="flex-shrink-0 text-sm bg-orange-100 text-orange-700 font-medium rounded-lg px-3 py-1.5">
                      {postulacionesPendientes} postulaci{postulacionesPendientes === 1 ? "ón" : "ones"}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
