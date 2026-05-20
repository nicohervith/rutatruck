"use client";

import { useState } from "react";

export default function PrecioPublicacionForm({ precioPublicacion }: { precioPublicacion: number }) {
  const [valor, setValor] = useState(String(precioPublicacion));
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const inputClass = "w-full rounded-lg border px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";
  const inputStyle = { backgroundColor: "#0F2020", borderColor: "#1E3838" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/precio-publicacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ precioPublicacion: parseFloat(valor) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setMsg({ ok: true, text: "Guardado correctamente" });
    } catch (err: unknown) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Error inesperado" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "#9CA3AF" }}>
          Precio de publicación ($ARS)
        </label>
        <input
          type="number"
          step="1"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className={inputClass}
          style={inputStyle}
          required
        />
      </div>
      {msg && (
        <p className={`text-sm ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
        style={{ backgroundColor: "var(--primary)", color: "#0C1E1E" }}
      >
        {pending ? "Guardando..." : "Guardar precio"}
      </button>
    </form>
  );
}
