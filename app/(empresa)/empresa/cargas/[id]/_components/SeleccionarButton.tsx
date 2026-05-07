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
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="flex items-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
        style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        {pending ? "Procesando..." : "Seleccionar"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
