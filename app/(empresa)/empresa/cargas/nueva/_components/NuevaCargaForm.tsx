"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ContactoDefecto {
  nombre: string;
  email: string;
  telefono: string;
}

export default function NuevaCargaForm({
  contactoDefecto,
}: {
  contactoDefecto: ContactoDefecto;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      router.push(`/empresa/cargas?success=1`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/empresa/dashboard" className="text-xl font-bold text-green-700">
          RutaTruck
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link
            href="/empresa/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 mb-3 inline-block"
          >
            ← Volver al panel
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">
            Publicar nueva carga
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Completá los datos del envío. La carga queda visible para transportistas inmediatamente.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos de la carga */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-medium text-gray-800">Datos de la carga</h2>

            <div>
              <label htmlFor="titulo" className={labelClass}>
                Título de la carga *
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                required
                className={inputClass}
                placeholder="Ej: Transporte de soja — Córdoba a Rosario"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="origen" className={labelClass}>
                  Origen *
                </label>
                <input
                  id="origen"
                  name="origen"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Ciudad / Provincia"
                />
              </div>
              <div>
                <label htmlFor="destino" className={labelClass}>
                  Destino *
                </label>
                <input
                  id="destino"
                  name="destino"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Ciudad / Provincia"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipoCarga" className={labelClass}>
                  Tipo de carga *
                </label>
                <select
                  id="tipoCarga"
                  name="tipoCarga"
                  required
                  defaultValue=""
                  className={`${inputClass} bg-white`}
                >
                  <option value="" disabled>
                    Seleccioná el tipo
                  </option>
                  <option value="granos">Granos</option>
                  <option value="frutas">Frutas</option>
                  <option value="verduras">Verduras</option>
                  <option value="animales">Animales</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label htmlFor="peso" className={labelClass}>
                  Peso estimado (toneladas)
                </label>
                <input
                  id="peso"
                  name="peso"
                  type="number"
                  step="0.1"
                  min="0"
                  className={inputClass}
                  placeholder="Ej: 28"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="presupuesto" className={labelClass}>
                  Presupuesto ofrecido ($)
                </label>
                <input
                  id="presupuesto"
                  name="presupuesto"
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputClass}
                  placeholder="Ej: 150000"
                />
              </div>
              <div>
                <label htmlFor="tiempoEstimado" className={labelClass}>
                  Tiempo estimado del viaje
                </label>
                <input
                  id="tiempoEstimado"
                  name="tiempoEstimado"
                  type="text"
                  className={inputClass}
                  placeholder="Ej: 2 días"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fechaCarga" className={labelClass}>
                  Fecha de carga *
                </label>
                <input
                  id="fechaCarga"
                  name="fechaCarga"
                  type="date"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="fechaEntrega" className={labelClass}>
                  Fecha de entrega estimada
                </label>
                <input
                  id="fechaEntrega"
                  name="fechaEntrega"
                  type="date"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="descripcion" className={labelClass}>
                Descripción adicional
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                className={inputClass}
                placeholder="Condiciones especiales, instrucciones de carga, etc."
              />
            </div>
          </div>

          {/* Datos de contacto */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-medium text-gray-800">Datos de contacto</h2>

            <div>
              <label htmlFor="contactoNombre" className={labelClass}>
                Nombre de contacto *
              </label>
              <input
                id="contactoNombre"
                name="contactoNombre"
                type="text"
                required
                defaultValue={contactoDefecto.nombre}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactoTelefono" className={labelClass}>
                  Teléfono *
                </label>
                <input
                  id="contactoTelefono"
                  name="contactoTelefono"
                  type="tel"
                  required
                  defaultValue={contactoDefecto.telefono}
                  className={inputClass}
                  placeholder="Ej: +54 9 351 000-0000"
                />
              </div>
              <div>
                <label htmlFor="contactoEmail" className={labelClass}>
                  Email *
                </label>
                <input
                  id="contactoEmail"
                  name="contactoEmail"
                  type="email"
                  required
                  defaultValue={contactoDefecto.email}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-4">
            <Link
              href="/empresa/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-medium rounded-lg px-6 py-2.5 transition-colors cursor-pointer"
            >
              {pending ? "Publicando..." : "Publicar carga"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
