import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBell from "../_components/NotificacionBell";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";

const TIPO_LABELS: Record<string, string> = {
  granos: "Granos",
  frutas: "Frutas",
  verduras: "Verduras",
  animales: "Animales",
  otro: "Otro",
};

export default async function TransportistaHistorialPage() {
  const session = await verifySession();

  const cargas = await db.carga.findMany({
    where: { transportistaAsignadoId: session.userId, estado: "FINALIZADA" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-4 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <LogoClickCargo />
        <div className="flex items-center gap-2">
          <NotificacionBell />
          <HamburgerMenu role="transportista" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
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
          <h1 className="text-3xl font-bold text-white">Historial de viajes</h1>
          <p className="mt-1.5 text-base" style={{ color: "#A8C5C5" }}>
            {cargas.length} viaje{cargas.length !== 1 ? "s" : ""} completado{cargas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {cargas.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#2DD4BF1A" }}>
              <svg className="w-6 h-6" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0h1m4-8h1a2 2 0 012 2v6h-3M13 8h5l2 4" />
              </svg>
            </div>
            <p style={{ color: "#A8C5C5" }}>Todavía no completaste ningún viaje.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cargas.map((carga: any) => (
              <Link
                key={carga.id}
                href={`/transportista/cargas/${carga.id}`}
                className="rounded-xl border block overflow-hidden hover:border-[#2DD4BF44] transition-all"
                style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#4ADE80" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4ADE80" }}>Completado</span>
                  </div>

                  <p className="text-xl font-bold text-white mb-1 leading-tight">
                    {carga.origen} <span style={{ color: "#2DD4BF" }}>→</span> {carga.destino}
                  </p>
                  <p className="text-sm mb-4" style={{ color: "#9CA3AF" }}>{carga.titulo}</p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#8BBDBD" }}>Tipo</p>
                      <p className="text-sm font-bold text-white">{TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#8BBDBD" }}>Fecha carga</p>
                      <p className="text-sm font-bold text-white">{carga.fechaCarga.toLocaleDateString("es-AR")}</p>
                    </div>
                    {carga.presupuesto !== null && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#8BBDBD" }}>Presupuesto</p>
                        <p className="text-sm font-bold" style={{ color: "#2DD4BF" }}>
                          ${carga.presupuesto.toLocaleString("es-AR")}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#8BBDBD" }}>Empresa</p>
                      <p className="text-sm font-bold text-white">{carga.contactoNombre}</p>
                    </div>
                  </div>
                </div>

                <div
                  className="px-5 py-3 flex items-center justify-center gap-2 text-sm font-semibold"
                  style={{ backgroundColor: "#2DD4BF1A", color: "#2DD4BF" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver detalle
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
