import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import Image from "next/image";
import logoImage from "@/app/assets/Logo5.jpeg";
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
        <Image src={logoImage} alt="ClickCargo" width={48} height={48} className="rounded-xl" />
        <div className="flex items-center gap-2">
          <NotificacionBell />
          <HamburgerMenu role="transportista" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Panel de Transportista</h2>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
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
              <span className="ml-1 bg-[#0C1E1E33] text-[#0C1E1E] text-xs font-bold px-2 py-0.5 rounded-full">
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
              <span className="ml-1 border border-[#2DD4BF33] text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2DD4BF1A" }}>
                {misPostulaciones}
              </span>
            )}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Cargas activas", value: totalCargas },
            { label: "Postulaciones", value: misPostulaciones },
            { label: "Completados", value: viajesCompletados },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border p-4 text-center"
              style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
            >
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs mt-1" style={{ color: "#6B7280" }}>{label}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
