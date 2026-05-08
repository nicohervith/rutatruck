import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBell from "../_components/NotificacionBell";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";
import CountdownTimer from "./[id]/_components/CountdownTimer";

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
  searchParams: Promise<{ success?: string; pago?: string }>;
}) {
  const session = await verifySession();
  const { success, pago } = await searchParams;

  const [cargas, misPostulaciones, pendientesPago] = await Promise.all([
    db.carga.findMany({
      where: { estado: "ACTIVA" },
      orderBy: { createdAt: "desc" },
    }),
    db.postulacion.findMany({
      where: { transportistaId: session.userId },
      select: { cargaId: true },
    }),
    db.carga.findMany({
      where: {
        transportistaAsignadoId: session.userId,
        estado: "PENDIENTE_PAGO_TRANSPORTISTA",
      },
      orderBy: { transportistaPagoDeadline: "asc" },
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
          <LogoClickCargo />
        </Link>
        <div className="flex items-center gap-2">
          <NotificacionBell />
          <HamburgerMenu role="transportista" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Cargas disponibles</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            {cargas.length} carga{cargas.length !== 1 ? "s" : ""} activa{cargas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {pago === "1" && (
          <div
            className="mb-6 rounded-xl px-4 py-3 flex items-center gap-3 border"
            style={{ backgroundColor: "#2DD4BF1A", borderColor: "#2DD4BF33" }}
          >
            <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#2DD4BF" }}>
              ¡Comisión pagada! El viaje está activado.
            </p>
          </div>
        )}

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

        {pendientesPago.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#FB923C" }}>
                Requieren pago — {pendientesPago.length} carga{pendientesPago.length !== 1 ? "s" : ""}
              </h2>
            </div>
            <div className="space-y-3">
              {pendientesPago.map((carga: any) => (
                <Link
                  key={carga.id}
                  href={`/transportista/cargas/${carga.id}`}
                  className="rounded-xl border block overflow-hidden transition-all hover:border-orange-400/40"
                  style={{ backgroundColor: "#1A1200", borderColor: "#78350F55" }}
                >
                  <div className="px-4 py-2 flex items-center justify-between border-b" style={{ borderColor: "#78350F55", backgroundColor: "#FB923C15" }}>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#FB923C" }}>
                      Pendiente de pago
                    </span>
                    {carga.transportistaPagoDeadline && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9CA3AF" }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <CountdownTimer deadline={carga.transportistaPagoDeadline.toISOString()} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-base font-bold text-white mb-1">
                      {carga.origen} → {carga.destino}
                    </p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>
                      {carga.titulo} · {TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga}
                      {carga.presupuesto !== null && ` · $${carga.presupuesto.toLocaleString("es-AR")}`}
                    </p>
                  </div>
                  <div
                    className="px-4 py-2.5 text-center text-sm font-semibold"
                    style={{ backgroundColor: "#FB923C", color: "#0C1E1E" }}
                  >
                    Pagar comisión →
                  </div>
                </Link>
              ))}
            </div>
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
          <div className="space-y-4">
            {cargas.map((carga: any) => {
              const yaPostulado = yaPostuladoEn.has(carga.id);
              return (
                <Link
                  key={carga.id}
                  href={`/transportista/cargas/${carga.id}`}
                  className="rounded-xl border block overflow-hidden hover:border-[#2DD4BF55] transition-all"
                  style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#2DD4BF" }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#2DD4BF" }}>Ruta</span>
                      {yaPostulado && (
                        <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                          ✓ Postulado
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-white mb-4">
                      {carga.origen} → {carga.destino}
                    </p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "#4B5563" }}>Tipo</p>
                        <p className="text-sm font-semibold text-white">{TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga}</p>
                      </div>
                      {carga.peso !== null && (
                        <div>
                          <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "#4B5563" }}>Toneladas</p>
                          <p className="text-sm font-semibold text-white">{carga.peso} tn</p>
                        </div>
                      )}
                      {carga.presupuesto !== null && (
                        <div>
                          <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "#4B5563" }}>Precio</p>
                          <p className="text-sm font-bold" style={{ color: "#2DD4BF" }}>
                            ${carga.presupuesto.toLocaleString("es-AR")}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: "#4B5563" }}>Fecha</p>
                        <p className="text-sm font-semibold text-white">{carga.fechaCarga.toLocaleDateString("es-AR")}</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="px-5 py-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
                    style={{ backgroundColor: yaPostulado ? "#2DD4BF1A" : "#2DD4BF", color: yaPostulado ? "#2DD4BF" : "#0C1E1E" }}
                  >
                    {yaPostulado ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                        </svg>
                        Ver mi postulación
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Me interesa
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
