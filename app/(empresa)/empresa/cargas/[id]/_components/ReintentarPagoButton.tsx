"use client";

import { useState } from "react";

export default function ReintentarPagoButton({ cargaId }: { cargaId: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setPending(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`/api/cargas/${cargaId}/reintentar-pago`, {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error inesperado");
      if (!data.url) throw new Error("No se recibió la URL de pago. Intentá de nuevo.");
      window.location.href = data.url;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("La conexión tardó demasiado. Verificá tu conexión e intentá de nuevo.");
      } else {
        setError(err instanceof Error ? err.message : "Error inesperado");
      }
      setPending(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 font-medium rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-60 cursor-pointer"
        style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
      >
        {pending ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Procesando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pagar publicación
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
