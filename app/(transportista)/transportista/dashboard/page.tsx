import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBell from "../_components/NotificacionBell";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";

export default async function TransportistaDashboard() {
  const session = await verifySession();

  const [totalCargas, misPostulaciones, viajesCompletados, enViaje] = await Promise.all([
    db.carga.count({ where: { estado: "ACTIVA" } }),
    db.postulacion.count({ where: { transportistaId: session.userId } }),
    db.postulacion.count({
      where: { transportistaId: session.userId, estado: "ACEPTADA", carga: { estado: "FINALIZADA" } },
    }),
    db.postulacion.count({
      where: { transportistaId: session.userId, estado: "ACEPTADA", carga: { estado: "ASIGNADA" } },
    }),
  ]);

  const acciones = [
    {
      href: "/transportista/cargas",
      label: "Cargas disponibles",
      sublabel: `${totalCargas} activa${totalCargas !== 1 ? "s" : ""} ahora`,
      count: totalCargas,
      primary: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: "/transportista/postulaciones",
      label: "Mis postulaciones",
      sublabel: `${misPostulaciones} en total`,
      count: misPostulaciones,
      primary: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: "/transportista/historial",
      label: "Historial",
      sublabel: `${viajesCompletados} viaje${viajesCompletados !== 1 ? "s" : ""} completado${viajesCompletados !== 1 ? "s" : ""}`,
      count: null,
      primary: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F5F5" }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <LogoClickCargo />
        <div className="flex items-center gap-2">
          <NotificacionBell />
          <HamburgerMenu role="transportista" isMultiRole={session.role === "EMPRESA_TRANSPORTISTA"} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Panel del transportista</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            Encontrá cargas y gestioná tus viajes
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Disponibles", value: totalCargas, color: "var(--primary)" },
            { label: "En viaje", value: enViaje, color: "#3B82F6" },
            { label: "Completados", value: viajesCompletados, color: "#22C55E" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border p-4 text-center"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
            >
              <p className="text-3xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: "#6B7280" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Nav cards */}
        <div className="flex flex-col gap-3">
          {acciones.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-opacity active:opacity-80"
              style={
                a.primary
                  ? { backgroundColor: "var(--primary)", color: "#FFFFFF" }
                  : { backgroundColor: "#FFFFFF", color: "#111827", border: "1px solid #E2E8E8" }
              }
            >
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={
                  a.primary
                    ? { backgroundColor: "rgba(255,255,255,0.15)" }
                    : { backgroundColor: "var(--primary-10)" }
                }
              >
                <span style={{ color: a.primary ? "#FFFFFF" : "var(--primary)" }}>
                  {a.icon}
                </span>
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{a.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{a.sublabel}</p>
              </div>
              {a.count != null && a.count > 0 && (
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0"
                  style={
                    a.primary
                      ? { backgroundColor: "rgba(255,255,255,0.2)", color: "#FFFFFF" }
                      : { backgroundColor: "var(--primary-13)", color: "var(--primary)" }
                  }
                >
                  {a.count}
                </span>
              )}
              <svg
                className="w-4 h-4 flex-shrink-0 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
