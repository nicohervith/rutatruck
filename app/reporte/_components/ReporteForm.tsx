"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

const TIPOS = [
  { value: "bug", label: "Error / Bug" },
  { value: "cuenta", label: "Problema con mi cuenta" },
  { value: "pago", label: "Problema con un pago" },
  { value: "carga", label: "Problema con una carga" },
  { value: "sugerencia", label: "Sugerencia de mejora" },
  { value: "otro", label: "Otro" },
];

export default function ReporteForm({
  defaultEmail,
  backHref,
}: {
  defaultEmail: string;
  backHref: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    email: defaultEmail,
    tipo: "",
    descripcion: "",
  });

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/reporte", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Error al enviar");
          return;
        }
        setEnviado(true);
      } catch {
        setError("Error de red. Intentá de nuevo.");
      }
    });
  }

  if (enviado) {
    return (
      <div className="text-center py-12 px-6">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Reporte enviado</h2>
        <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
          Recibimos tu reporte. Lo revisaremos a la brevedad.
        </p>
        <Link
          href={backHref}
          className="inline-block px-6 py-3 rounded-xl font-semibold text-sm text-white"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Volver
        </Link>
      </div>
    );
  }

  const inputClass = "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";
  const inputStyle = { borderColor: "#E2E8E8", backgroundColor: "#F9FAFB" };
  const labelClass = "block text-sm font-semibold mb-1.5";
  const labelStyle = { color: "#374151" };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass} style={labelStyle}>Nombre *</label>
        <input
          required
          name="nombre"
          value={form.nombre}
          onChange={set("nombre")}
          placeholder="Tu nombre"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Email *</label>
        <input
          required
          type="email"
          name="email"
          value={form.email}
          onChange={set("email")}
          placeholder="tu@email.com"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Tipo de problema *</label>
        <select
          required
          name="tipo"
          value={form.tipo}
          onChange={set("tipo")}
          className={inputClass}
          style={inputStyle}
        >
          <option value="">Seleccioná una opción</option>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.label}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>Descripción *</label>
        <textarea
          required
          name="descripcion"
          value={form.descripcion}
          onChange={set("descripcion")}
          rows={5}
          placeholder="Describí lo que pasó con el mayor detalle posible: qué estabas haciendo, qué esperabas que ocurra, qué ocurrió en cambio..."
          className={inputClass + " resize-none"}
          style={inputStyle}
        />
      </div>

      {error && (
        <p className="text-sm font-medium px-4 py-3 rounded-xl" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 rounded-xl font-bold text-white transition-opacity"
        style={{ backgroundColor: "var(--primary)", opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? "Enviando..." : "Enviar reporte"}
      </button>
    </form>
  );
}
