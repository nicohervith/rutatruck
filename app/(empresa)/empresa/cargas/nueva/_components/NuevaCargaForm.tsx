"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoImage from "@/app/assets/Logo5.jpeg";

interface ContactoDefecto {
  nombre: string;
  email: string;
  telefono: string;
}

export default function NuevaCargaForm({
  contactoDefecto,
  precioPublicacion,
  errorInicial,
}: {
  contactoDefecto: ContactoDefecto;
  precioPublicacion: number;
  errorInicial?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(errorInicial ?? null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());

    try {
      const res = await fetch("/api/cargas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear la carga");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent text-sm";
  const inputStyle = { backgroundColor: "#0F2020", borderColor: "#1E3838" };
  const labelClass = "block text-sm font-medium mb-1" ;
  const labelStyle = { color: "#9CA3AF" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <Link href="/empresa/dashboard">
          <Image src={logoImage} alt="ClickCargo" width={48} height={48} className="rounded-xl" />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link
            href="/empresa/dashboard"
            className="text-sm mb-3 inline-block transition-colors"
            style={{ color: "#6B7280" }}
          >
            ← Volver al panel
          </Link>
          <h1 className="text-2xl font-semibold text-white">Publicar nueva carga</h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            Completá los datos del envío. Una vez procesado el pago de publicación, la carga quedará visible para transportistas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="rounded-xl border p-6 space-y-4"
            style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
          >
            <h2 className="font-medium text-white">Datos de la carga</h2>

            <div>
              <label htmlFor="titulo" className={labelClass} style={labelStyle}>
                Título de la carga *
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                required
                className={inputClass}
                style={inputStyle}
                placeholder="Ej: Transporte de soja — Córdoba a Rosario"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="origen" className={labelClass} style={labelStyle}>
                  Origen *
                </label>
                <input
                  id="origen"
                  name="origen"
                  type="text"
                  required
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Ciudad / Provincia"
                />
              </div>
              <div>
                <label htmlFor="destino" className={labelClass} style={labelStyle}>
                  Destino *
                </label>
                <input
                  id="destino"
                  name="destino"
                  type="text"
                  required
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Ciudad / Provincia"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipoCarga" className={labelClass} style={labelStyle}>
                  Tipo de carga *
                </label>
                <select
                  id="tipoCarga"
                  name="tipoCarga"
                  required
                  defaultValue=""
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="" disabled style={{ backgroundColor: "#0F2020" }}>Seleccioná el tipo</option>
                  <option value="granos" style={{ backgroundColor: "#0F2020" }}>Granos</option>
                  <option value="frutas" style={{ backgroundColor: "#0F2020" }}>Frutas</option>
                  <option value="verduras" style={{ backgroundColor: "#0F2020" }}>Verduras</option>
                  <option value="animales" style={{ backgroundColor: "#0F2020" }}>Animales</option>
                  <option value="otro" style={{ backgroundColor: "#0F2020" }}>Otro</option>
                </select>
              </div>
              <div>
                <label htmlFor="peso" className={labelClass} style={labelStyle}>
                  Peso estimado (toneladas)
                </label>
                <input
                  id="peso"
                  name="peso"
                  type="number"
                  step="0.1"
                  min="0"
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Ej: 28"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="presupuesto" className={labelClass} style={labelStyle}>
                  Presupuesto ofrecido ($)
                </label>
                <input
                  id="presupuesto"
                  name="presupuesto"
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Ej: 150000"
                />
              </div>
              <div>
                <label htmlFor="tiempoEstimado" className={labelClass} style={labelStyle}>
                  Tiempo estimado del viaje
                </label>
                <input
                  id="tiempoEstimado"
                  name="tiempoEstimado"
                  type="text"
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Ej: 2 días"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fechaCarga" className={labelClass} style={labelStyle}>
                  Fecha de carga *
                </label>
                <input
                  id="fechaCarga"
                  name="fechaCarga"
                  type="date"
                  required
                  className={inputClass}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </div>
              <div>
                <label htmlFor="fechaEntrega" className={labelClass} style={labelStyle}>
                  Fecha de entrega estimada
                </label>
                <input
                  id="fechaEntrega"
                  name="fechaEntrega"
                  type="date"
                  className={inputClass}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="descripcion" className={labelClass} style={labelStyle}>
                Descripción adicional
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                className={inputClass}
                style={inputStyle}
                placeholder="Condiciones especiales, instrucciones de carga, etc."
              />
            </div>
          </div>

          <div
            className="rounded-xl border p-6 space-y-4"
            style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
          >
            <h2 className="font-medium text-white">Datos de contacto</h2>

            <div>
              <label htmlFor="contactoNombre" className={labelClass} style={labelStyle}>
                Nombre de contacto *
              </label>
              <input
                id="contactoNombre"
                name="contactoNombre"
                type="text"
                required
                defaultValue={contactoDefecto.nombre}
                className={inputClass}
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactoTelefono" className={labelClass} style={labelStyle}>
                  Teléfono *
                </label>
                <input
                  id="contactoTelefono"
                  name="contactoTelefono"
                  type="tel"
                  required
                  defaultValue={contactoDefecto.telefono}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Ej: +54 9 351 000-0000"
                />
              </div>
              <div>
                <label htmlFor="contactoEmail" className={labelClass} style={labelStyle}>
                  Email *
                </label>
                <input
                  id="contactoEmail"
                  name="contactoEmail"
                  type="email"
                  required
                  defaultValue={contactoDefecto.email}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ backgroundColor: "#2DD4BF0D", borderColor: "#2DD4BF33", color: "#2DD4BF" }}
          >
            Al continuar serás redirigido a MercadoPago para abonar la tarifa de publicación de{" "}
            <strong>${precioPublicacion.toLocaleString("es-AR")}</strong>.
          </div>

          <div className="flex items-center justify-end gap-4">
            <Link
              href="/empresa/dashboard"
              className="text-sm transition-colors"
              style={{ color: "#6B7280" }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="font-medium rounded-lg px-6 py-2.5 transition-colors cursor-pointer disabled:opacity-60 text-sm"
              style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
            >
              {pending ? "Procesando..." : "Ir al pago →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
