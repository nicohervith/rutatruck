"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

function hoyInput(): string {
  return new Date().toISOString().split("T")[0];
}

export default function ReactivarCargaButton({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const result = await Swal.fire({
      title: "Reactivar carga",
      text: "Elegí la nueva fecha de carga. La convocatoria vuelve a abrirse desde cero.",
      input: "date",
      inputAttributes: { min: hoyInput() },
      inputValue: hoyInput(),
      showCancelButton: true,
      confirmButtonText: "Reactivar",
      cancelButtonText: "Volver",
      background: "#112424",
      color: "#ffffff",
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "#1E3838",
      inputValidator: (value) => (value ? undefined : "Elegí una fecha"),
    });

    if (!result.isConfirmed || !result.value) return;

    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/cargas/${cargaId}/reactivar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fechaCarga: result.value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al reactivar");
      await Swal.fire({
        title: "Carga reactivada",
        text: "Vuelve a estar visible para los transportistas.",
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
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 text-sm font-medium rounded-lg px-4 py-2 transition-colors cursor-pointer disabled:opacity-60 border"
        style={{ borderColor: "var(--primary-27)", color: "var(--primary)", backgroundColor: "var(--primary-5)" }}
      >
        {pending ? "Reactivando..." : "Reactivar carga"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
