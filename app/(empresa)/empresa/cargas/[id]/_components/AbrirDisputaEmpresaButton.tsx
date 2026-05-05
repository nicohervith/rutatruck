"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function AbrirDisputaEmpresaButton({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const result = await Swal.fire({
      title: "Abrir disputa",
      text: "Describí el motivo del problema con el viaje.",
      input: "textarea",
      inputPlaceholder: "Describí el motivo de la disputa...",
      showCancelButton: true,
      confirmButtonText: "Abrir disputa",
      cancelButtonText: "Cancelar",
      background: "#112424",
      color: "#ffffff",
      confirmButtonColor: "#F97316",
      cancelButtonColor: "#1E3838",
      icon: "warning",
      iconColor: "#F97316",
      didOpen: () => {
        const input = Swal.getInput();
        if (input) {
          input.style.backgroundColor = "#0F2020";
          input.style.borderColor = "#1E3838";
          input.style.color = "#ffffff";
          input.style.borderRadius = "8px";
        }
      },
      preConfirm: (value: string) => {
        if (!value?.trim()) {
          Swal.showValidationMessage("Ingresá una descripción");
          return false;
        }
        return value.trim();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/disputa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: result.value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al abrir disputa");
      await Swal.fire({
        title: "Disputa abierta",
        text: "El equipo revisará el caso.",
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
        className="text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer disabled:opacity-60 border border-orange-500/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
      >
        {pending ? "Enviando..." : "Abrir disputa"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
