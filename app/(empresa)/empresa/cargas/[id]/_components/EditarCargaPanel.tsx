"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

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
  "w-full rounded-lg border px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent text-sm";
const inputStyle = { backgroundColor: "#0F2020", borderColor: "#1E3838" };
const labelClass = "block text-sm font-medium mb-1";
const labelStyle = { color: "#9CA3AF" };

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

  async function handleCancelarCarga() {
    const result = await Swal.fire({
      title: "¿Cancelar esta carga?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
      background: "#112424",
      color: "#ffffff",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#1E3838",
      iconColor: "#EF4444",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/cargas/${carga.id}/cancelar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cancelar");
      await Swal.fire({
        title: "Carga cancelada",
        icon: "success",
        confirmButtonText: "Aceptar",
        background: "#112424",
        color: "#ffffff",
        confirmButtonColor: "#2DD4BF",
        iconColor: "#4ADE80",
      });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setOpen(true)}
          className="text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer border"
          style={{ borderColor: "#2DD4BF33", color: "#2DD4BF", backgroundColor: "#2DD4BF0D" }}
        >
          Editar carga
        </button>
        <button
          onClick={handleCancelarCarga}
          className="text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
        >
          Cancelar carga
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="font-medium text-white mb-4">Editar carga</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-titulo" className={labelClass} style={labelStyle}>Título *</label>
          <input id="edit-titulo" name="titulo" type="text" required defaultValue={carga.titulo} className={inputClass} style={inputStyle} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-origen" className={labelClass} style={labelStyle}>Origen *</label>
            <input id="edit-origen" name="origen" type="text" required defaultValue={carga.origen} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="edit-destino" className={labelClass} style={labelStyle}>Destino *</label>
            <input id="edit-destino" name="destino" type="text" required defaultValue={carga.destino} className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-tipoCarga" className={labelClass} style={labelStyle}>Tipo de carga *</label>
            <select id="edit-tipoCarga" name="tipoCarga" required defaultValue={carga.tipoCarga} className={inputClass} style={inputStyle}>
              <option value="granos" style={{ backgroundColor: "#0F2020" }}>Granos</option>
              <option value="frutas" style={{ backgroundColor: "#0F2020" }}>Frutas</option>
              <option value="verduras" style={{ backgroundColor: "#0F2020" }}>Verduras</option>
              <option value="animales" style={{ backgroundColor: "#0F2020" }}>Animales</option>
              <option value="otro" style={{ backgroundColor: "#0F2020" }}>Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-peso" className={labelClass} style={labelStyle}>Peso (toneladas)</label>
            <input id="edit-peso" name="peso" type="number" step="0.1" min="0" defaultValue={carga.peso ?? ""} className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-volumen" className={labelClass} style={labelStyle}>Volumen (m³)</label>
            <input id="edit-volumen" name="volumen" type="number" step="0.1" min="0" defaultValue={carga.volumen ?? ""} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="edit-tiempoEstimado" className={labelClass} style={labelStyle}>Tiempo estimado</label>
            <input id="edit-tiempoEstimado" name="tiempoEstimado" type="text" defaultValue={carga.tiempoEstimado ?? ""} className={inputClass} style={inputStyle} placeholder="Ej: 2 días" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-fechaCarga" className={labelClass} style={labelStyle}>Fecha de carga *</label>
            <input id="edit-fechaCarga" name="fechaCarga" type="date" required defaultValue={carga.fechaCarga} className={inputClass} style={{ ...inputStyle, colorScheme: "dark" }} />
          </div>
          <div>
            <label htmlFor="edit-fechaEntrega" className={labelClass} style={labelStyle}>Fecha de entrega</label>
            <input id="edit-fechaEntrega" name="fechaEntrega" type="date" defaultValue={carga.fechaEntrega ?? ""} className={inputClass} style={{ ...inputStyle, colorScheme: "dark" }} />
          </div>
        </div>

        <div>
          <label htmlFor="edit-descripcion" className={labelClass} style={labelStyle}>Descripción</label>
          <textarea id="edit-descripcion" name="descripcion" rows={3} defaultValue={carga.descripcion ?? ""} className={inputClass} style={inputStyle} placeholder="Condiciones especiales, instrucciones, etc." />
        </div>

        <div>
          <label htmlFor="edit-contactoNombre" className={labelClass} style={labelStyle}>Nombre de contacto *</label>
          <input id="edit-contactoNombre" name="contactoNombre" type="text" required defaultValue={carga.contactoNombre} className={inputClass} style={inputStyle} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-contactoTelefono" className={labelClass} style={labelStyle}>Teléfono *</label>
            <input id="edit-contactoTelefono" name="contactoTelefono" type="tel" required defaultValue={carga.contactoTelefono} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="edit-contactoEmail" className={labelClass} style={labelStyle}>Email *</label>
            <input id="edit-contactoEmail" name="contactoEmail" type="email" required defaultValue={carga.contactoEmail} className={inputClass} style={inputStyle} />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="text-sm font-medium rounded-lg px-5 py-2.5 transition-colors cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null); }}
            className="text-sm px-4 py-2 transition-colors"
            style={{ color: "#6B7280" }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
