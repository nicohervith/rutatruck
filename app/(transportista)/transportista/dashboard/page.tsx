import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBell from "../_components/NotificacionBell";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";

export default async function TransportistaDashboard() {
  const session = await verifySession();

  const [totalCargas, misPostulaciones, viajesCompletados] = await Promise.all([
    db.carga.count({ where: { estado: "ACTIVA" } }),
    db.postulacion.count({ where: { transportistaId: session.userId } }),
    db.carga.count({ where: { transportistaAsignadoId: session.userId, estado: "FINALIZADA" } }),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <LogoClickCargo />
        <div className="flex items-center gap-2">
          <NotificacionBell />
          <HamburgerMenu role="transportista" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Panel de Transportista</h2>
          <p className="mt-2 text-base" style={{ color: "#A8C5C5" }}>
            Encontrá cargas y gestioná tus viajes
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <Link
            href="/transportista/cargas"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver cargas disponibles
            {totalCargas > 0 && (
              <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#0A1A1A", color: "#2DD4BF" }}>
                {totalCargas}
              </span>
            )}
          </Link>
          <Link
            href="/transportista/postulaciones"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-semibold text-base border-2 transition-colors hover:bg-[#2DD4BF0D]"
            style={{ borderColor: "#2DD4BF", color: "#2DD4BF" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mis postulaciones
            {misPostulaciones > 0 && (
              <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}>
                {misPostulaciones}
              </span>
            )}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Cargas activas",
              value: totalCargas,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h.01M12 17h.01M16 17h.01M3 9h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM9 9V5a3 3 0 016 0v4" />
                </svg>
              ),
            },
            {
              label: "Postulaciones",
              value: misPostulaciones,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              label: "Completados",
              value: viajesCompletados,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ),
            },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="rounded-xl border p-4 text-center flex flex-col items-center gap-2"
              style={{ backgroundColor: "#112424", borderColor: "#2DD4BF33" }}
            >
              <span style={{ color: "#2DD4BF" }}>{icon}</span>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-sm font-medium" style={{ color: "#C4DCDC" }}>{label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
