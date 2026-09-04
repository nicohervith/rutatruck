"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  COMENTARIO_MAX,
  DIAS_REVELADO,
  criteriosDe,
  type CriterioKey,
  type TipoResena,
} from "@/lib/resenas";

function Estrellas({
  valor,
  onChange,
  nombre,
}: {
  valor: number;
  onChange: (n: number) => void;
  nombre: string;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={nombre}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
        >
          <svg
            className="w-7 h-7"
            viewBox="0 0 20 20"
            fill={n <= valor ? "#F59E0B" : "#E2E8E8"}
            aria-hidden="true"
          >
            <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.35 4.15h4.36c.97 0 1.37 1.24.59 1.81l-3.53 2.56 1.35 4.15c.3.92-.76 1.69-1.54 1.12L10 14.16l-3.53 2.56c-.78.57-1.84-.2-1.54-1.12l1.35-4.15L2.75 8.9c-.78-.57-.38-1.81.59-1.81h4.36l1.35-4.15z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

/**
 * Formulario de calificación de un viaje finalizado. La reseña queda oculta
 * hasta que la contraparte también califica (o pasan DIAS_REVELADO días), así
 * que el texto se lo aclara al usuario antes de enviar.
 */
export default function ResenaForm({
  cargaId,
  destinatarioId,
  destinatarioNombre,
  tipo,
}: {
  cargaId: number;
  destinatarioId: string;
  destinatarioNombre: string;
  tipo: TipoResena;
}) {
  const router = useRouter();
  const criterios = criteriosDe(tipo);
  const [puntajes, setPuntajes] = useState<Partial<Record<CriterioKey, number>>>({});
  const [comentario, setComentario] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completo = criterios.every((c) => puntajes[c.key] != null);

  async function handleSubmit() {
    if (!completo || pending) return;

    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cargaId,
          destinatarioId,
          puntajes,
          comentario: comentario.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar la calificación");

      await Swal.fire({
        title: "¡Gracias!",
        text: data.publicada
          ? "Tu calificación ya es visible."
          : `Se publica cuando ${destinatarioNombre} también califique, o a los ${DIAS_REVELADO} días.`,
        icon: "success",
        confirmButtonText: "Aceptar",
        background: "#112424",
        color: "#ffffff",
        confirmButtonColor: "var(--primary)",
        iconColor: "#4ADE80",
      });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setPending(false);
    }
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: "#FAFAFA", borderColor: "#E2E8E8" }}
    >
      <p className="font-medium text-gray-900 mb-3">Calificá a {destinatarioNombre}</p>

      <div className="space-y-3">
        {criterios.map((criterio) => (
          <div key={criterio.key} className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{criterio.label}</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>
                {criterio.ayuda}
              </p>
            </div>
            <Estrellas
              nombre={criterio.label}
              valor={puntajes[criterio.key] ?? 0}
              onChange={(n) => setPuntajes((prev) => ({ ...prev, [criterio.key]: n }))}
            />
          </div>
        ))}
      </div>

      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value.slice(0, COMENTARIO_MAX))}
        placeholder="Comentario (opcional)"
        rows={3}
        className="mt-4 w-full rounded-xl border px-3 py-2 text-sm text-gray-900 resize-none"
        style={{ borderColor: "#E2E8E8", backgroundColor: "#FFFFFF" }}
      />
      <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
        {comentario.length}/{COMENTARIO_MAX} · Tu calificación queda oculta hasta que la otra parte
        califique o pasen {DIAS_REVELADO} días.
      </p>

      <button
        onClick={handleSubmit}
        disabled={!completo || pending}
        className="mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={{ backgroundColor: "var(--primary)", color: "var(--text-white)" }}
      >
        {pending ? "Enviando..." : "Enviar calificación"}
      </button>
      {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
    </div>
  );
}
