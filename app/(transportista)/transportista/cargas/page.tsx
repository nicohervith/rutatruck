import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";

const TIPO_LABELS: Record<string, string> = {
  granos: "Granos",
  frutas: "Frutas",
  verduras: "Verduras",
  animales: "Animales",
  otro: "Otro",
};

export default async function TransportistasCargasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await verifySession();
  const { success } = await searchParams;

  const [cargas, misPostulaciones] = await Promise.all([
    db.carga.findMany({
      where: { estado: "ACTIVA" },
      orderBy: { createdAt: "desc" },
    }),
    db.postulacion.findMany({
      where: { transportistaId: session.userId },
      select: { cargaId: true },
    }),
  ]);

  const yaPostuladoEn = new Set(misPostulaciones.map((p:any) => p.cargaId));

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
            href="/transportista/postulaciones"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Mis postulaciones
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
            Cargas disponibles
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {cargas.length} carga{cargas.length !== 1 ? "s" : ""} activa
            {cargas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {success === "1" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-sm text-green-800 font-medium">
              ¡Postulación enviada! La empresa te contactará si te selecciona.
            </p>
          </div>
        )}

        {cargas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">
              No hay cargas disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cargas.map((carga: any) => (
              <Link
                key={carga.id}
                href={`/transportista/cargas/${carga.id}`}
                className="bg-white rounded-xl border border-gray-100 p-5 flex items-start justify-between gap-4 hover:border-gray-200 hover:shadow-sm transition-all block"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-800 truncate">
                      {carga.titulo}
                    </h3>
                    {yaPostuladoEn.has(carga.id) && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                        Postulado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {carga.origen} → {carga.destino}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {carga.fechaCarga.toLocaleDateString("es-AR")} ·{" "}
                    {TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga}
                    {carga.peso !== null && ` · ${carga.peso}t`}
                    {carga.presupuesto !== null &&
                      ` · $${carga.presupuesto.toLocaleString("es-AR")}`}
                  </p>
                </div>
                <span className="flex-shrink-0 text-sm text-green-700 font-medium">
                  Ver →
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
