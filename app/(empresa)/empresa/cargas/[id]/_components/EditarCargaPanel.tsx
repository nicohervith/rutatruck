"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CargaEditable {
  id: number;
  titulo: string;
  origen: string;
  destino: string;
  tipoCarga: string;
  peso: number | null;
  volumen: number | null;
  fechaCarga: string;
  fechaEntrega: string | null;
  tiempoEstimado: string | null;
  descripcion: string | null;
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent text-sm";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function EditarCargaPanel({ carga }: { carga: CargaEditable }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const res = await fetch(`/api/cargas/${carga.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-brand-navy hover:text-brand-navy-dark border border-brand-border bg-brand-light hover:bg-brand-light font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer"
      >
        Editar carga
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4">
      <h3 className="font-medium text-gray-800 mb-4">Editar carga</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-titulo" className={labelClass}>Título *</label>
          <input id="edit-titulo" name="titulo" type="text" required defaultValue={carga.titulo} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-origen" className={labelClass}>Origen *</label>
            <input id="edit-origen" name="origen" type="text" required defaultValue={carga.origen} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-destino" className={labelClass}>Destino *</label>
            <input id="edit-destino" name="destino" type="text" required defaultValue={carga.destino} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-tipoCarga" className={labelClass}>Tipo de carga *</label>
            <select id="edit-tipoCarga" name="tipoCarga" required defaultValue={carga.tipoCarga} className={`${inputClass} bg-white`}>
              <option value="granos">Granos</option>
              <option value="frutas">Frutas</option>
              <option value="verduras">Verduras</option>
              <option value="animales">Animales</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-peso" className={labelClass}>Peso (toneladas)</label>
            <input id="edit-peso" name="peso" type="number" step="0.1" min="0" defaultValue={carga.peso ?? ""} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-volumen" className={labelClass}>Volumen (m³)</label>
            <input id="edit-volumen" name="volumen" type="number" step="0.1" min="0" defaultValue={carga.volumen ?? ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-tiempoEstimado" className={labelClass}>Tiempo estimado</label>
            <input id="edit-tiempoEstimado" name="tiempoEstimado" type="text" defaultValue={carga.tiempoEstimado ?? ""} className={inputClass} placeholder="Ej: 2 días" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-fechaCarga" className={labelClass}>Fecha de carga *</label>
            <input id="edit-fechaCarga" name="fechaCarga" type="date" required defaultValue={carga.fechaCarga} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-fechaEntrega" className={labelClass}>Fecha de entrega</label>
            <input id="edit-fechaEntrega" name="fechaEntrega" type="date" defaultValue={carga.fechaEntrega ?? ""} className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="edit-descripcion" className={labelClass}>Descripción</label>
          <textarea id="edit-descripcion" name="descripcion" rows={3} defaultValue={carga.descripcion ?? ""} className={inputClass} placeholder="Condiciones especiales, instrucciones, etc." />
        </div>

        <div>
          <label htmlFor="edit-contactoNombre" className={labelClass}>Nombre de contacto *</label>
          <input id="edit-contactoNombre" name="contactoNombre" type="text" required defaultValue={carga.contactoNombre} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-contactoTelefono" className={labelClass}>Teléfono *</label>
            <input id="edit-contactoTelefono" name="contactoTelefono" type="tel" required defaultValue={carga.contactoTelefono} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-contactoEmail" className={labelClass}>Email *</label>
            <input id="edit-contactoEmail" name="contactoEmail" type="email" required defaultValue={carga.contactoEmail} className={inputClass} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="bg-brand-navy hover:bg-brand-navy-dark disabled:opacity-60 text-white text-sm font-medium rounded-lg px-5 py-2.5 transition-colors cursor-pointer"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
