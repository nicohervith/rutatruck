import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { logout } from "@/app/actions/auth";
import Image from "next/image";
import logoImage from "@/app/assets/Logo5.jpeg";
import NotificacionBell from "../_components/NotificacionBell";

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

  const yaPostuladoEn = new Set(misPostulaciones.map((p: any) => p.cargaId));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <Link href="/transportista/dashboard">
          <Image src={logoImage} alt="ClickCargo" width={48} height={48} className="rounded-xl" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/transportista/postulaciones"
            className="text-sm transition-colors"
            style={{ color: "#6B7280" }}
          >
            Mis postulaciones
          </Link>
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

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white">Cargas disponibles</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            {cargas.length} carga{cargas.length !== 1 ? "s" : ""} activa{cargas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {success === "1" && (
          <div
            className="mb-6 rounded-xl px-4 py-3 flex items-center gap-3 border"
            style={{ backgroundColor: "#2DD4BF1A", borderColor: "#2DD4BF33" }}
          >
            <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#2DD4BF" }}>
              ¡Postulación enviada! La empresa te contactará si te selecciona.
            </p>
          </div>
        )}

        {cargas.length === 0 ? (
          <div
            className="rounded-xl border p-12 text-center"
            style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
          >
            <p style={{ color: "#6B7280" }}>No hay cargas disponibles en este momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cargas.map((carga: any) => (
              <Link
                key={carga.id}
                href={`/transportista/cargas/${carga.id}`}
                className="rounded-xl border p-5 flex items-start justify-between gap-4 hover:border-[#2DD4BF33] transition-all block"
                style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate">{carga.titulo}</h3>
                    {yaPostuladoEn.has(carga.id) && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 flex-shrink-0">
                        Postulado
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: "#6B7280" }}>
                    {carga.origen} → {carga.destino}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#4B5563" }}>
                    {carga.fechaCarga.toLocaleDateString("es-AR")} ·{" "}
                    {TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga}
                    {carga.peso !== null && ` · ${carga.peso}t`}
                    {carga.presupuesto !== null && ` · $${carga.presupuesto.toLocaleString("es-AR")}`}
                  </p>
                </div>
                <span className="flex-shrink-0 text-sm font-medium" style={{ color: "#2DD4BF" }}>
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
