"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  cargaId: number;
  postulacionId: number;
  transportistaNombre: string;
}

export default function SeleccionarButton({ cargaId, postulacionId, transportistaNombre }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm(`¿Seleccionar a ${transportistaNombre} como transportista para esta carga?`)) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/seleccionar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postulacionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al seleccionar");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="text-sm bg-brand-navy hover:bg-brand-navy-dark disabled:opacity-60 text-white font-medium rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
      >
        {pending ? "Procesando..." : "Seleccionar"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
