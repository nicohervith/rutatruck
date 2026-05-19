"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function ConfirmarCompletadoButton({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const result = await Swal.fire({
      title: "¿Confirmar viaje completado?",
      text: "Esta acción marcará el viaje como finalizado exitosamente.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Volver",
      background: "#112424",
      color: "#ffffff",
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "#1E3838",
      iconColor: "var(--primary)",
    });

    if (!result.isConfirmed) return;

    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/confirmar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al confirmar");
      await Swal.fire({
        title: "Viaje confirmado",
        text: "El viaje fue marcado como completado.",
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
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
        style={{ backgroundColor: "var(--primary)", color: "#0C1E1E" }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        {pending ? "Confirmando..." : "Confirmar viaje completado"}
      </button>
      {error && <p className="text-xs text-red-300 text-center">{error}</p>}
    </div>
  );
}
