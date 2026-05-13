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

const TIPO_ICONS: Record<string, JSX.Element> = {
  granos: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1M4.22 4.22l.707.707M18.364 18.364l.707.707M3 12h1m16 0h1M4.927 19.073l.707-.707M18.364 5.636l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  frutas: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2c0 0-4 4-4 8a4 4 0 008 0c0-4-4-8-4-8z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2c0 0 2-2 4-1" />
    </svg>
  ),
  verduras: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l4 9H3l2-5m4-4l4 9h-6m4-9l4 9h-6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v9" />
    </svg>
  ),
  animales: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM6 7c0 1.1-.9 2-2 2S2 8.1 2 7s.9-2 2-2 2 .9 2 2zm2-4c0 1.1-.9 2-2 2S4 4.1 4 3s.9-2 2-2 2 .9 2 2zm8 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM12 10a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z" />
    </svg>
  ),
  otro: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
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
        className="px-4 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <LogoClickCargo />
        <div className="flex items-center gap-2">
          <NotificacionBell />
          <HamburgerMenu role="transportista" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-6">
          <Link
            href="/transportista/dashboard"
            className="inline-flex items-center gap-2 mb-4 font-semibold text-sm transition-colors hover:opacity-80"
            style={{ color: "#2DD4BF" }}
          >
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full border-2"
              style={{ borderColor: "#2DD4BF" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            Volver al panel
          </Link>
          <h1 className="text-3xl font-bold text-white">Cargas disponibles</h1>
          <p className="mt-1.5 text-base" style={{ color: "#A8C5C5" }}>
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
            <p style={{ color: "#A8C5C5" }}>No hay cargas disponibles en este momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cargas.map((carga: any) => {
              const yaPostulado = yaPostuladoEn.has(carga.id);
              const tipoIcon = TIPO_ICONS[carga.tipoCarga] ?? TIPO_ICONS.otro;
              return (
                <Link
                  key={carga.id}
                  href={`/transportista/cargas/${carga.id}`}
                  className="rounded-xl border block overflow-hidden hover:border-[#2DD4BF55] transition-all"
                  style={{ backgroundColor: "#112424", borderColor: "#2DD4BF22" }}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#2DD4BF" }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2DD4BF" }}>Ruta</span>
                      {yaPostulado && (
                        <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                          ✓ Postulado
                        </span>
                      )}
                    </div>

                    <p className="text-xl font-bold text-white mb-4 leading-tight">
                      {carga.origen} <span style={{ color: "#2DD4BF" }}>→</span> {carga.destino}
                    </p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0" style={{ color: "#2DD4BF" }}>{tipoIcon}</span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#8BBDBD" }}>Tipo</p>
                          <p className="text-sm font-bold text-white">{TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga}</p>
                        </div>
                      </div>

                      {carga.peso !== null && (
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 flex-shrink-0" style={{ color: "#2DD4BF" }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#8BBDBD" }}>Toneladas</p>
                            <p className="text-sm font-bold text-white">{carga.peso} tn</p>
                          </div>
                        </div>
                      )}

                      {carga.presupuesto !== null && (
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 flex-shrink-0" style={{ color: "#2DD4BF" }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#8BBDBD" }}>Precio</p>
                            <p className="text-sm font-bold" style={{ color: "#2DD4BF" }}>
                              ${carga.presupuesto.toLocaleString("es-AR")}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex-shrink-0" style={{ color: "#2DD4BF" }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#8BBDBD" }}>Fecha</p>
                          <p className="text-sm font-bold text-white">{carga.fechaCarga.toLocaleDateString("es-AR")}</p>
                        </div>
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
