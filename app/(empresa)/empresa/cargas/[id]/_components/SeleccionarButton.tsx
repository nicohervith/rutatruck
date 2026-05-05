"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

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
    const result = await Swal.fire({
      title: "¿Seleccionar transportista?",
      text: `Se asignará a ${transportistaNombre} para esta carga.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, seleccionar",
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
      const res = await fetch(`/api/cargas/${cargaId}/seleccionar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postulacionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al seleccionar");
      await Swal.fire({
        title: "¡Transportista asignado!",
        text: `${transportistaNombre} fue seleccionado y notificado.`,
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
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="text-sm font-medium rounded-lg px-3 py-1.5 transition-colors cursor-pointer disabled:opacity-60"
        style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
      >
        {pending ? "Procesando..." : "Seleccionar"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
