"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  cargaId: number;
  miPostulacion: { id: number; estado: string; mensaje: string | null } | null;
}

export default function PostularseButton({ cargaId, miPostulacion }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  if (miPostulacion) {
    const colorMap: Record<string, string> = {
      PENDIENTE: "bg-blue-50 border-blue-100 text-blue-800",
      ACEPTADA: "bg-green-50 border-green-200 text-green-800",
      RECHAZADA: "bg-gray-50 border-gray-200 text-gray-600",
    };
    const labelMap: Record<string, string> = {
      PENDIENTE: "Tu postulación está pendiente. La empresa te contactará si te selecciona.",
      ACEPTADA: "¡Fuiste seleccionado para esta carga! La empresa se pondrá en contacto.",
      RECHAZADA: "La empresa seleccionó otro transportista para esta carga.",
    };
    return (
      <div className={`rounded-xl border p-4 ${colorMap[miPostulacion.estado] ?? colorMap.PENDIENTE}`}>
        <p className="text-sm font-medium">{labelMap[miPostulacion.estado] ?? "Estado desconocido"}</p>
        {miPostulacion.mensaje && (
          <p className="text-xs mt-1 opacity-70">Tu mensaje: "{miPostulacion.mensaje}"</p>
        )}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/postulaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargaId, mensaje: mensaje || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al postularse");
      router.push(`/transportista/cargas?success=1`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="font-medium text-gray-800 mb-4">Postularme a esta carga</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje para la empresa (opcional)
        </label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent text-sm"
          placeholder="Presentate brevemente, indicá tu experiencia o disponibilidad..."
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">{error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-navy hover:bg-brand-navy-dark disabled:opacity-60 text-white font-medium rounded-lg px-6 py-2.5 transition-colors cursor-pointer"
      >
        {pending ? "Enviando..." : "Enviar postulación"}
      </button>
    </form>
  );
}
