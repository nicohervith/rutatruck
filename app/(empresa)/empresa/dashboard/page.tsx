import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import Image from "next/image";
import logoImage from "@/app/assets/Logo.jpeg";
import NotificacionBellEmpresa from "../_components/NotificacionBellEmpresa";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  PENDIENTE_PAGO: { label: "Pago pendiente", color: "bg-yellow-100 text-yellow-800" },
  ACTIVA: { label: "Activa", color: "bg-green-100 text-green-800" },
  ASIGNADA: { label: "Asignada", color: "bg-blue-100 text-blue-800" },
  EN_CONFIRMACION: { label: "Confirmar completado", color: "bg-orange-100 text-orange-800" },
  FINALIZADA: { label: "Finalizada", color: "bg-gray-100 text-gray-600" },
  CANCELADA: { label: "Cancelada", color: "bg-red-100 text-red-800" },
  DISPUTA: { label: "En disputa", color: "bg-purple-100 text-purple-800" },
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Image src={logoImage} alt="ClickCargo" width={120} height={40} />
        <div className="flex items-center gap-4">
          <NotificacionBellEmpresa />
          <Link
            href="/empresa/cargas/nueva"
            className="text-sm bg-brand-navy hover:bg-brand-navy-dark text-white font-medium rounded-lg px-4 py-2 transition-colors"
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Panel de Empresa</h2>
          <p className="text-gray-500 mt-1">Publicá cargas y gestioná tus transportistas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Cargas publicadas</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{totalCargas}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Postulaciones pendientes</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{totalPostulaciones}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Viajes completados</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{totalFinalizadas}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-800">Últimas cargas</h3>
          <Link href="/empresa/cargas" className="text-sm text-brand-navy hover:text-brand-navy-dark">
            Ver todas →
          </Link>
        </div>

        {cargas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-400 mb-4">Todavía no publicaste cargas</p>
            <Link
              href="/empresa/cargas/nueva"
              className="bg-brand-navy hover:bg-brand-navy-dark text-white font-medium rounded-lg px-6 py-2.5 transition-colors inline-block"
            >
              Publicar primera carga
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cargas.map((carga:any) => {
              const estado = ESTADO_LABELS[carga.estado] ?? { label: carga.estado, color: "bg-gray-100 text-gray-600" };
              const pendientes = carga._count.postulaciones;
              return (
                <Link
                  key={carga.id}
                  href={`/empresa/cargas/${carga.id}`}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex items-start justify-between gap-4 hover:border-gray-200 hover:shadow-sm transition-all block"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-800 truncate">{carga.titulo}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${estado.color}`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{carga.origen} → {carga.destino}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {carga.fechaCarga.toLocaleDateString("es-AR")} · {carga.tipoCarga}
                      {carga.peso !== null && ` · ${carga.peso}t`}
                    </p>
                  </div>
                  {pendientes > 0 && (
                    <span className="flex-shrink-0 text-sm bg-orange-100 text-orange-700 font-medium rounded-lg px-3 py-1.5">
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
