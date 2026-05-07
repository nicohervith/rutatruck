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
    const styleMap: Record<string, React.CSSProperties> = {
      PENDIENTE: { backgroundColor: "#2DD4BF1A", borderColor: "#2DD4BF33", color: "#2DD4BF" },
      ACEPTADA: { backgroundColor: "#4ADE801A", borderColor: "#4ADE8033", color: "#4ADE80" },
      RECHAZADA: { backgroundColor: "#FFFFFF0A", borderColor: "#1E3838", color: "#6B7280" },
    };
    const labelMap: Record<string, string> = {
      PENDIENTE: "Tu postulación está pendiente. La empresa te contactará si te selecciona.",
      ACEPTADA: "¡Fuiste seleccionado para esta carga! La empresa se pondrá en contacto.",
      RECHAZADA: "La empresa seleccionó otro transportista para esta carga.",
    };
    const cardStyle = styleMap[miPostulacion.estado] ?? styleMap.PENDIENTE;
    return (
      <div className="rounded-xl border p-4" style={cardStyle}>
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
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border p-6"
      style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
    >
      <h2 className="font-medium text-white mb-4">Postularme a esta carga</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: "#9CA3AF" }}>
          Mensaje para la empresa (opcional)
        </label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent text-sm"
          style={{ backgroundColor: "#0F2020", borderColor: "#1E3838" }}
          placeholder="Presentate brevemente, indicá tu experiencia o disponibilidad..."
        />
      </div>
      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 mb-4">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 font-semibold rounded-xl px-6 py-4 text-base transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-60"
        style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
      >
        {pending ? "Enviando..." : "Enviar postulación"}
      </button>
    </form>
  );
}
