"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function CompletarViajeButton({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const result = await Swal.fire({
      title: "¿Marcar como completado?",
      text: "La empresa deberá confirmar el viaje.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, completado",
      cancelButtonText: "Cancelar",
      background: "#112424",
      color: "#ffffff",
      confirmButtonColor: "#2DD4BF",
      cancelButtonColor: "#1E3838",
      iconColor: "#2DD4BF",
    });

    if (!result.isConfirmed) return;

    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/completar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al marcar completado");
      await Swal.fire({
        title: "¡Listo!",
        text: "Viaje marcado como completado. Esperando confirmación de la empresa.",
        icon: "success",
        confirmButtonText: "Aceptar",
        background: "#112424",
        color: "#ffffff",
        confirmButtonColor: "#2DD4BF",
        iconColor: "#4ADE80",
      });
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
        className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors cursor-pointer"
      >
        {pending ? "Procesando..." : "Marcar viaje como completado"}
      </button>
      {error && (
        <p className="text-xs text-red-300">{error}</p>
      )}
    </div>
  );
}
