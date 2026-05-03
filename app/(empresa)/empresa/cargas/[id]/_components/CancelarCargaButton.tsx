"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelarCargaButton({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("¿Cancelar esta carga? Esta acción no se puede deshacer.")) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/cancelar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cancelar");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 disabled:opacity-60 font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer"
      >
        {pending ? "Cancelando..." : "Cancelar carga"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
