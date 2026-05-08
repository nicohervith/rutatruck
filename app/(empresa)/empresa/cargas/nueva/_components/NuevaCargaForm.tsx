"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoImage from "@/app/assets/Logo5.jpeg";
import LocationAutocomplete from "./LocationAutocomplete";

const DRAFT_KEY = "clickcargo-nueva-carga-draft";

interface ContactoDefecto {
  nombre: string;
  email: string;
  telefono: string;
}

type Fields = {
  titulo: string;
  origen: string;
  destino: string;
  tipoCarga: string;
  peso: string;
  presupuesto: string;
  fechaCarga: string;
  fechaCupo: string;
  preferenciaCamion: string;
  descripcion: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
};

function makeDefaults(c: ContactoDefecto): Fields {
  return {
    titulo: "", origen: "", destino: "", tipoCarga: "",
    peso: "", presupuesto: "", fechaCarga: "", fechaCupo: "",
    preferenciaCamion: "", descripcion: "",
    contactoNombre: c.nombre,
    contactoTelefono: c.telefono,
    contactoEmail: c.email,
  };
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
  useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(errorInicial ?? null);
  const [fields, setFields] = useState<Fields>(() => makeDefaults(contactoDefecto));
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Fields>;
        setFields(f => ({ ...f, ...parsed }));
        setHasDraft(true);
      }
    } catch {}
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(fields));
    }, 500);
    return () => { if (saveRef.current) clearTimeout(saveRef.current); };
  }, [fields, draftLoaded]);

  function set(name: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields(f => ({ ...f, [name]: e.target.value }));
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setFields(makeDefaults(contactoDefecto));
    setHasDraft(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/cargas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear la carga");
      localStorage.removeItem(DRAFT_KEY);
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent text-sm";
  const inputStyle = { backgroundColor: "#0F2020", borderColor: "#1E3838" };
  const labelClass = "block text-sm font-medium mb-1";
  const labelStyle = { color: "#9CA3AF" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <Link href="/empresa/dashboard">
          <Image
            src={logoImage}
            alt="ClickCargo"
            width={48}
            height={48}
            className="rounded-xl"
          />
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
          <h1 className="text-2xl font-semibold text-white">
            Publicar nueva carga
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
            Completá los datos del envío. Una vez procesado el pago de
            publicación, la carga quedará visible para transportistas.
          </p>
        </div>

        {hasDraft && (
          <div
            className="mb-4 flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm"
            style={{ backgroundColor: "#2DD4BF0D", borderColor: "#2DD4BF33", color: "#2DD4BF" }}
          >
            <span>Borrador restaurado</span>
            <button
              type="button"
              onClick={clearDraft}
              className="text-xs underline opacity-70 hover:opacity-100 cursor-pointer"
            >
              Limpiar
            </button>
          </div>
        )}

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
                value={fields.titulo}
                onChange={set("titulo")}
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
                <LocationAutocomplete
                  id="origen"
                  name="origen"
                  required
                  inputClass={inputClass}
                  inputStyle={inputStyle}
                  placeholder="Ciudad / Provincia"
                  initialValue={fields.origen}
                  onValueChange={v => setFields(f => ({ ...f, origen: v }))}
                />
              </div>
              <div>
                <label htmlFor="destino" className={labelClass} style={labelStyle}>
                  Destino *
                </label>
                <LocationAutocomplete
                  id="destino"
                  name="destino"
                  required
                  inputClass={inputClass}
                  inputStyle={inputStyle}
                  placeholder="Ciudad / Provincia"
                  initialValue={fields.destino}
                  onValueChange={v => setFields(f => ({ ...f, destino: v }))}
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
                  value={fields.tipoCarga}
                  onChange={set("tipoCarga")}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="" disabled style={{ backgroundColor: "#0F2020" }}>
                    Seleccioná el tipo
                  </option>
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
                  value={fields.peso}
                  onChange={set("peso")}
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
                  value={fields.presupuesto}
                  onChange={set("presupuesto")}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Ej: 150000"
                />
              </div>
              <div>
                <label htmlFor="preferenciaCamion" className={labelClass} style={labelStyle}>
                  Preferencia de camión
                </label>
                <input
                  id="preferenciaCamion"
                  name="preferenciaCamion"
                  type="text"
                  value={fields.preferenciaCamion}
                  onChange={set("preferenciaCamion")}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Ej: Camión jaula, semiremolque, etc."
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
                  value={fields.fechaCarga}
                  onChange={set("fechaCarga")}
                  className={inputClass}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </div>
              <div>
                <label htmlFor="fechaCupo" className={labelClass} style={labelStyle}>
                  Fecha de cupo
                </label>
                <input
                  id="fechaCupo"
                  name="fechaCupo"
                  type="date"
                  value={fields.fechaCupo}
                  onChange={set("fechaCupo")}
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
                value={fields.descripcion}
                onChange={set("descripcion")}
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
                value={fields.contactoNombre}
                onChange={set("contactoNombre")}
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
                  value={fields.contactoTelefono}
                  onChange={set("contactoTelefono")}
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
                  value={fields.contactoEmail}
                  onChange={set("contactoEmail")}
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
            style={{
              backgroundColor: "#2DD4BF0D",
              borderColor: "#2DD4BF33",
              color: "#2DD4BF",
            }}
          >
            Al continuar serás redirigido a MercadoPago para abonar la tarifa de
            publicación de{" "}
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
