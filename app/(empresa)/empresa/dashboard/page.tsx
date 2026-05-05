import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import Image from "next/image";
import logoImage from "@/app/assets/Logo5.jpeg";
import NotificacionBellEmpresa from "../_components/NotificacionBellEmpresa";

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
        <Image src={logoImage} alt="ClickCargo" width={48} height={48} className="rounded-xl" />
        <div className="flex items-center gap-4">
          <NotificacionBellEmpresa />
          <Link
            href="/empresa/cargas/nueva"
            className="text-sm font-medium rounded-lg px-4 py-2 transition-colors text-white"
            style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
          >
            + Nueva carga
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm transition-colors cursor-pointer hover:text-gray-400"
              style={{ color: "#6B7280" }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white">Panel de Empresa</h2>
          <p className="mt-1" style={{ color: "#6B7280" }}>
            Publicá cargas y gestioná tus transportistas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Cargas publicadas", value: totalCargas },
            { label: "Postulaciones pendientes", value: totalPostulaciones },
            { label: "Viajes completados", value: totalFinalizadas },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border p-6"
              style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
            >
              <p className="text-sm" style={{ color: "#6B7280" }}>{label}</p>
              <p className="text-3xl font-bold text-white mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white">Últimas cargas</h3>
          <Link
            href="/empresa/cargas"
            className="text-sm transition-colors"
            style={{ color: "#2DD4BF" }}
          >
            Ver todas →
          </Link>
        </div>

        {cargas.length === 0 ? (
          <div
            className="rounded-xl border p-10 text-center"
            style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
          >
            <p className="mb-4" style={{ color: "#6B7280" }}>Todavía no publicaste cargas</p>
            <Link
              href="/empresa/cargas/nueva"
              className="font-medium rounded-lg px-6 py-2.5 transition-colors inline-block text-sm"
              style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
            >
              Publicar primera carga
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cargas.map((carga: any) => {
              const estado = ESTADO_LABELS[carga.estado] ?? { label: carga.estado, color: "bg-white/10 text-gray-400" };
              const pendientes = carga._count.postulaciones;
              return (
                <Link
                  key={carga.id}
                  href={`/empresa/cargas/${carga.id}`}
                  className="rounded-xl border p-5 flex items-start justify-between gap-4 transition-all block hover:border-[#2DD4BF33]"
                  style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white truncate">{carga.titulo}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${estado.color}`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "#6B7280" }}>
                      {carga.origen} → {carga.destino}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#4B5563" }}>
                      {carga.fechaCarga.toLocaleDateString("es-AR")} · {carga.tipoCarga}
                      {carga.peso !== null && ` · ${carga.peso}t`}
                    </p>
                  </div>
                  {pendientes > 0 && (
                    <span className="flex-shrink-0 text-sm font-medium rounded-lg px-3 py-1.5 bg-orange-500/20 text-orange-300">
                      {pendientes} postulaci{pendientes === 1 ? "ón" : "ones"}
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
