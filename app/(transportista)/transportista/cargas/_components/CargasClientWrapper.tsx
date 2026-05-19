"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { CargaMapItem } from "./MapaCargas";
import CountdownTimer from "../[id]/_components/CountdownTimer";
import { getIconoCarga } from "@/lib/iconos-carga";

// Dynamic import to avoid SSR issues with mapbox-gl
const MapaCargas = dynamic(() => import("./MapaCargas"), { ssr: false });

const TIPO_LABELS: Record<string, string> = {
  granos: "Granos", frutas: "Frutas", verduras: "Verduras", animales: "Animales", otro: "Otro",
};

type PendientePago = {
  id: number;
  titulo: string;
  origen: string;
  destino: string;
  tipoCarga: string;
  presupuesto: number | null;
  transportistaPagoDeadline: string | null;
};

interface Props {
  cargas: CargaMapItem[];
  yaPostuladoIds: number[];
  pendientesPago: PendientePago[];
  success?: string;
  pago?: string;
}

export default function CargasClientWrapper({
  cargas,
  yaPostuladoIds,
  pendientesPago,
  success,
  pago,
}: Props) {
  const [viewMode, setViewMode] = useState<"listado" | "mapa">("listado");
  const yaPostuladoSet = new Set(yaPostuladoIds);

  return (
    <>
      {/* ── Toggle bar ───────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 border-b px-4"
        style={{ backgroundColor: "#F2F5F5", borderColor: "#E2E8E8" }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2 py-2.5">
          <button
            type="button"
            onClick={() => setViewMode("listado")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={
              viewMode === "listado"
                ? { backgroundColor: "var(--primary)", color: "#FFFFFF" }
                : { backgroundColor: "#FFFFFF", color: "#6B7280", border: "1px solid #E2E8E8" }
            }
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Listado
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mapa")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={
              viewMode === "mapa"
                ? { backgroundColor: "var(--primary)", color: "#FFFFFF" }
                : { backgroundColor: "#FFFFFF", color: "#6B7280", border: "1px solid #E2E8E8" }
            }
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Mapa
          </button>
          <span className="ml-auto text-xs font-medium" style={{ color: "#9CA3AF" }}>
            {cargas.length} activa{cargas.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Map overlay ──────────────────────────────────────────────────────── */}
      {viewMode === "mapa" && (
        <MapaCargas
          cargas={cargas}
          yaPostuladoIds={yaPostuladoIds}
          onClose={() => setViewMode("listado")}
        />
      )}

      {/* ── List view ────────────────────────────────────────────────────────── */}
      {viewMode === "listado" && (
        <main className="max-w-2xl mx-auto px-5 py-8 w-full">
          <div className="mb-6">
            <Link
              href="/transportista/dashboard"
              className="inline-flex items-center gap-2 mb-4 font-semibold text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full border-2"
                style={{ borderColor: "var(--primary)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
              Volver al panel
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Cargas disponibles</h1>
            <p className="mt-1.5 text-base" style={{ color: "#374151" }}>
              {cargas.length} carga{cargas.length !== 1 ? "s" : ""} activa{cargas.length !== 1 ? "s" : ""}
            </p>
          </div>

          {pago === "1" && (
            <div
              className="mb-6 rounded-xl px-4 py-3 flex items-center gap-3 border"
              style={{ backgroundColor: "var(--primary-10)", borderColor: "var(--primary-20)" }}
            >
              <svg className="w-5 h-5 flex-shrink-0" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                ¡Comisión pagada! El viaje está activado.
              </p>
            </div>
          )}

          {success === "1" && (
            <div
              className="mb-6 rounded-xl px-4 py-3 flex items-center gap-3 border"
              style={{ backgroundColor: "var(--primary-10)", borderColor: "var(--primary-20)" }}
            >
              <svg className="w-5 h-5 flex-shrink-0" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                ¡Postulación enviada! La empresa te contactará si te selecciona.
              </p>
            </div>
          )}

          {/* Pendientes de pago */}
          {pendientesPago.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#FB923C" }}>
                  Requieren pago — {pendientesPago.length} carga{pendientesPago.length !== 1 ? "s" : ""}
                </h2>
              </div>
              <div className="space-y-3">
                {pendientesPago.map((carga) => (
                  <Link
                    key={carga.id}
                    href={`/transportista/cargas/${carga.id}`}
                    className="rounded-xl border block overflow-hidden transition-all hover:border-orange-400/40"
                    style={{ backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }}
                  >
                    <div className="px-4 py-2 flex items-center justify-between border-b" style={{ borderColor: "#FED7AA", backgroundColor: "#FEF3E2" }}>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#EA580C" }}>
                        Pendiente de pago
                      </span>
                      {carga.transportistaPagoDeadline && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9CA3AF" }}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <CountdownTimer deadline={carga.transportistaPagoDeadline} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-base font-bold text-gray-900 mb-1">
                        {carga.origen} → {carga.destino}
                      </p>
                      <p className="text-xs" style={{ color: "#9CA3AF" }}>
                        {carga.titulo} · {TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga}
                        {carga.presupuesto !== null && ` · $${carga.presupuesto.toLocaleString("es-AR")}`}
                      </p>
                    </div>
                    <div
                      className="px-4 py-2.5 text-center text-sm font-semibold"
                      style={{ backgroundColor: "#FB923C", color: "#FFFFFF" }}
                    >
                      Pagar comisión →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Main cargas list */}
          {cargas.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
            >
              <p style={{ color: "#374151" }}>No hay cargas disponibles en este momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cargas.map((carga) => {
                const yaPostulado = yaPostuladoSet.has(carga.id);
                const emoji = getIconoCarga(carga.tipoCarga, carga.tipoCargaDetalle);
                return (
                  <Link
                    key={carga.id}
                    href={`/transportista/cargas/${carga.id}`}
                    className="rounded-xl border block overflow-hidden hover:border-[var(--primary-33)] transition-all"
                    style={{ backgroundColor: "#FFFFFF", borderColor: "var(--primary-13)" }}
                  >
                    <div className="p-5">
                      {yaPostulado && (
                        <div className="mb-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--primary-10)", color: "var(--primary)", border: "1px solid var(--primary-20)" }}>
                            ✓ Ya me postulé
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-4xl leading-none flex-shrink-0">{emoji}</span>
                          <div className="min-w-0">
                            <p className="text-xl font-black text-gray-900 leading-tight">{TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga}</p>
                            {carga.tipoCargaDetalle && (
                              <p className="text-sm font-medium mt-0.5 truncate" style={{ color: "#6B7280" }}>{carga.tipoCargaDetalle}</p>
                            )}
                          </div>
                        </div>
                        {carga.presupuesto !== null && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B7280" }}>Precio</p>
                            <p className="text-lg font-black" style={{ color: "var(--primary)" }}>
                              ${carga.presupuesto.toLocaleString("es-AR")}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--primary)" }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Ruta</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 mb-4 leading-tight">
                        {carga.origen} <span style={{ color: "var(--primary)" }}>→</span> {carga.destino}
                      </p>

                      <div className="flex items-end justify-between">
                        {carga.peso !== null ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B7280" }}>Toneladas</p>
                            <p className="text-sm font-bold text-gray-900">{carga.peso} tn</p>
                          </div>
                        ) : <div />}
                        <div className="text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6B7280" }}>Fecha</p>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(carga.fechaCarga).toLocaleDateString("es-AR")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="px-5 py-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
                      style={{ backgroundColor: yaPostulado ? "var(--primary-27)" : "var(--primary)", color: yaPostulado ? "var(--primary)" : "#FFFFFF" }}
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
      )}
    </>
  );
}
