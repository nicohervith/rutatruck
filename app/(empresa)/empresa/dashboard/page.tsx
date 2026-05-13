import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBellEmpresa from "../_components/NotificacionBellEmpresa";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE_PAGO: { label: "Pago pendiente", color: "bg-yellow-500/20 text-yellow-300" },
  ACTIVA: { label: "Activa", color: "bg-green-500/20 text-green-300" },
  ASIGNADA: { label: "Asignada", color: "bg-blue-500/20 text-blue-300" },
  EN_CONFIRMACION: { label: "Confirmar completado", color: "bg-orange-500/20 text-orange-300" },
  FINALIZADA: { label: "Finalizada", color: "bg-white/10 text-gray-400" },
  CANCELADA: { label: "Cancelada", color: "bg-red-500/20 text-red-300" },
  DISPUTA: { label: "En disputa", color: "bg-purple-500/20 text-purple-300" },
};

export default async function EmpresaDashboard() {
  const session = await verifySession();

  const cargas = await db.carga.findMany({
    where: { empresaId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      _count: { select: { postulaciones: { where: { estado: "PENDIENTE" } } } },
    },
  });

  const totalCargas = await db.carga.count({ where: { empresaId: session.userId } });
  const totalPostulaciones = await db.postulacion.count({
    where: { carga: { empresaId: session.userId }, estado: "PENDIENTE" },
  });
  const totalFinalizadas = await db.carga.count({
    where: { empresaId: session.userId, estado: "FINALIZADA" },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <LogoClickCargo />
        <div className="flex items-center gap-2">
          <NotificacionBellEmpresa />
          <HamburgerMenu role="empresa" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Panel de Empresa</h2>
          <p className="mt-2 text-base" style={{ color: "#A8C5C5" }}>
            Publicá cargas y gestioná tus transportistas
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <Link
            href="/empresa/cargas/nueva"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Publicar carga
          </Link>
          <Link
            href="/empresa/cargas"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-semibold text-base border-2 transition-colors hover:bg-[#2DD4BF0D]"
            style={{ borderColor: "#2DD4BF", color: "#2DD4BF" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Mis cargas
            {totalPostulaciones > 0 && (
              <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}>
                {totalPostulaciones} pendientes
              </span>
            )}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            {
              label: "Publicadas",
              value: totalCargas,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
            },
            {
              label: "Postulaciones",
              value: totalPostulaciones,
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
            {
              label: "Completados",
              value: totalFinalizadas,
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

        {cargas.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium" style={{ color: "#9CA3AF" }}>Últimas cargas</h3>
              <Link href="/empresa/cargas" className="text-xs transition-colors" style={{ color: "#2DD4BF" }}>
                Ver todas →
              </Link>
            </div>
            <div className="space-y-2">
              {cargas.map((carga: any) => {
                const estado = ESTADO_LABELS[carga.estado] ?? { label: carga.estado, color: "bg-white/10 text-gray-400" };
                const pendientes = carga._count.postulaciones;
                return (
                  <Link
                    key={carga.id}
                    href={`/empresa/cargas/${carga.id}`}
                    className="rounded-xl border p-4 flex items-center justify-between gap-3 transition-all block hover:border-[#2DD4BF33]"
                    style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{carga.titulo}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#A8C5C5" }}>
                        {carga.origen} → {carga.destino}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {pendientes > 0 && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-500/20 text-orange-300">
                          {pendientes}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estado.color}`}>
                        {estado.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
