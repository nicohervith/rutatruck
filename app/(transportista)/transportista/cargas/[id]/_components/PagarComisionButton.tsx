"use client";

import { useState } from "react";

export default function PagarComisionButton({
  cargaId,
  montoComision,
}: {
  cargaId: number;
  montoComision: number;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/pagos/crear-preferencia-transportista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cargaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear pago");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
        style={{ backgroundColor: "var(--primary)", color: "#0C1E1E" }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        {pending
          ? "Redirigiendo..."
          : `Pagar comisión — $${montoComision.toLocaleString("es-AR")}`}
      </button>
      {error && <p className="text-xs text-red-300 text-center">{error}</p>}
    </div>
  );
}
