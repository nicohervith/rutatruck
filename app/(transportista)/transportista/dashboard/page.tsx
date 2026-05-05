import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import Image from "next/image";
import logoImage from "@/app/assets/Logo5.jpeg";
import NotificacionBell from "../_components/NotificacionBell";

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
        <div className="flex items-center gap-4">
          <NotificacionBell />
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
          <h2 className="text-2xl font-semibold text-white">Panel de Transportista</h2>
          <p className="mt-1" style={{ color: "#6B7280" }}>
            Encontrá cargas disponibles y gestioná tus viajes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Cargas disponibles", value: totalCargas },
            { label: "Mis postulaciones", value: misPostulaciones },
            { label: "Viajes completados", value: viajesCompletados },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/transportista/cargas"
            className="rounded-xl border p-8 text-center transition-all block hover:border-[#2DD4BF33]"
            style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
          >
            <p className="font-medium text-white mb-1">Ver cargas disponibles</p>
            <p className="text-sm" style={{ color: "#6B7280" }}>Explorá cargas activas y postulate</p>
          </Link>
          <Link
            href="/transportista/postulaciones"
            className="rounded-xl border p-8 text-center transition-all block hover:border-[#2DD4BF33]"
            style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
          >
            <p className="font-medium text-white mb-1">Mis postulaciones</p>
            <p className="text-sm" style={{ color: "#6B7280" }}>Seguí el estado de tus postulaciones</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
