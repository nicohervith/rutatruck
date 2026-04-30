"use client";

import { useState } from "react";

interface Props {
  cargaId: number;
  postulacionId: number;
  transportistaNombre: string;
  presupuesto: number | null;
}

export default function SeleccionarButton({ cargaId, postulacionId, transportistaNombre, presupuesto }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm(`¿Seleccionar a ${transportistaNombre} como transportista?`)) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/pagos/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargaId, postulacionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear el pago");
      window.location.href = data.url;
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
        className="text-sm bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-medium rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
      >
        {pending ? "Procesando..." : presupuesto ? `Seleccionar y pagar $${presupuesto.toLocaleString("es-AR")}` : "Seleccionar"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!presupuesto && (
        <p className="text-xs text-gray-400">Sin presupuesto definido</p>
      )}
    </div>
  );
}
