"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CerrarConvocatoriaButton({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("¿Cerrar la convocatoria? La carga pasará a ASIGNADA con los transportistas ya aceptados.")) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/cerrar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cerrar");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 border text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer disabled:opacity-60"
        style={{ borderColor: "#E2E8E8", color: "#374151", backgroundColor: "#F9FAFB" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {pending ? "Cerrando..." : "Cerrar convocatoria"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
