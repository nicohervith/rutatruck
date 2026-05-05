"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function CancelarCargaButton({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const result = await Swal.fire({
      title: "¿Cancelar esta carga?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
      background: "#112424",
      color: "#ffffff",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#1E3838",
      iconColor: "#EF4444",
    });

    if (!result.isConfirmed) return;

    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/cancelar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cancelar");
      await Swal.fire({
        title: "Carga cancelada",
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
        className="text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer disabled:opacity-60 border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
      >
        {pending ? "Cancelando..." : "Cancelar carga"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
