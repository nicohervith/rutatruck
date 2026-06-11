import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBellEmpresa from "../_components/NotificacionBellEmpresa";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";
import { logout } from "@/app/actions/auth";
import SwitchRoleButton from "@/app/_components/SwitchRoleButton";

const ESTADO_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PENDIENTE_PAGO:              { label: "Pago pendiente",        bg: "#FEF3C7", text: "#92400E" },
  ACTIVA:                      { label: "Activa",                bg: "#DCFCE7", text: "#166534" },
  PENDIENTE_PAGO_TRANSPORTISTA:{ label: "Esperando pago",        bg: "#FEF3C7", text: "#92400E" },
  ASIGNADA:                    { label: "Asignada",              bg: "#DBEAFE", text: "#1E40AF" },
  EN_CONFIRMACION:             { label: "Confirmar completado",  bg: "#FFEDD5", text: "#9A3412" },
  FINALIZADA:                  { label: "Finalizada",            bg: "#F3F4F6", text: "#6B7280" },
  CANCELADA:                   { label: "Cancelada",             bg: "#FEE2E2", text: "#991B1B" },
  DISPUTA:                     { label: "En disputa",            bg: "#F3E8FF", text: "#6B21A8" },
};

export default async function EmpresaDashboard() {
  const session = await verifySession();

  const [cargas, totalEnGestion, totalPostulaciones, totalActivas, totalFinalizadas, user] = await Promise.all([
    db.carga.findMany({
      where: { empresaId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: { select: { postulaciones: { where: { estado: "PENDIENTE" } } } },
      },
    }),
    db.carga.count({ where: { empresaId: session.userId, estado: { notIn: ["FINALIZADA", "CANCELADA"] } } }),
    db.postulacion.count({
      where: { carga: { empresaId: session.userId }, estado: "PENDIENTE" },
    }),
    db.carga.count({ where: { empresaId: session.userId, estado: "ACTIVA" } }),
    db.carga.count({ where: { empresaId: session.userId, estado: "FINALIZADA" } }),
    db.user.findUnique({ where: { id: session.userId }, select: { name: true } }),
  ]);

  const acciones = [
    {
      href: "/empresa/cargas/nueva",
      label: "Publicar carga",
      sublabel: "Nueva convocatoria de transportistas",
      count: null,
      primary: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      href: "/empresa/cargas",
      label: "Mis cargas",
      sublabel: `${totalEnGestion} en gestión`,
      count: totalPostulaciones,
      primary: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      href: "/empresa/historial",
      label: "Historial",
      sublabel: `${totalFinalizadas} viaje${totalFinalizadas !== 1 ? "s" : ""} finalizado${totalFinalizadas !== 1 ? "s" : ""}`,
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
          <NotificacionBellEmpresa />
          <HamburgerMenu role="empresa" isMultiRole={session.role === "EMPRESA_TRANSPORTISTA"} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">¡Hola, {user?.name}!</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            Publicá cargas y gestioná tus transportistas
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "En gestión",   value: totalEnGestion,     color: "var(--primary)" },
            { label: "Activas",      value: totalActivas,       color: "#22C55E" },
            { label: "Finalizadas",  value: totalFinalizadas,   color: "#6B7280" },
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
        <div className="flex flex-col gap-3 mb-8">
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
                  style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                >
                  {a.count} pend.
                </span>
              )}
              <svg className="w-4 h-4 flex-shrink-0 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Account actions — mobile only */}
        <div className="md:hidden mb-8 flex flex-col gap-3">
          {session.role === "EMPRESA_TRANSPORTISTA" && (
            <SwitchRoleButton
              toRole="transportista"
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border text-left transition-opacity active:opacity-80"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8", color: "#111827" }}
            >
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EFF6FF" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#3B82F6" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </span>
              <span className="font-semibold text-sm">Cambiar a transportista</span>
            </SwitchRoleButton>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl border text-left transition-opacity active:opacity-80 cursor-pointer"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8", color: "#6B7280" }}
            >
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FEF2F2" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#EF4444" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              <span className="font-semibold text-sm">Cerrar sesión</span>
            </button>
          </form>
          {/* <Link
            href="/reporte"
            className="text-xs text-center py-2"
            style={{ color: "#9CA3AF" }}
          >
            Reportar un problema
          </Link> */}
        </div>

        {/* Recent cargas */}
        {cargas.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                Últimas cargas
              </h3>
              <Link href="/empresa/cargas" className="text-xs font-medium transition-colors" style={{ color: "var(--primary)" }}>
                Ver todas →
              </Link>
            </div>
            <div className="space-y-2">
              {cargas.map((carga: any) => {
                const cfg = ESTADO_CONFIG[carga.estado] ?? { label: carga.estado, bg: "#F3F4F6", text: "#6B7280" };
                const pendientes = carga._count.postulaciones;
                return (
                  <Link
                    key={carga.id}
                    href={`/empresa/cargas/${carga.id}`}
                    className="rounded-xl border p-4 flex items-center justify-between gap-3 block transition-all hover:shadow-sm"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{carga.titulo}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                        {carga.origen} → {carga.destino}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {pendientes > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                          {pendientes} pend.
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
                        {cfg.label}
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
