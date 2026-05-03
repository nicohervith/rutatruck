"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompletarViajeButton({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("¿Marcar este viaje como completado? La empresa deberá confirmarlo.")) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/completar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al marcar completado");
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
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors cursor-pointer"
      >
        {pending ? "Procesando..." : "Marcar viaje como completado"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
