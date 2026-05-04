"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AbrirDisputaTransportistaButton({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/disputa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al abrir disputa");
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
        className="w-full text-sm text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 font-medium rounded-lg px-4 py-2.5 transition-colors cursor-pointer"
      >
        Abrir disputa
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={3}
        required
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        placeholder="Describí el motivo de la disputa..."
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !descripcion.trim()}
          className="text-sm bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer"
        >
          {pending ? "Enviando..." : "Confirmar disputa"}
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
  );
}
