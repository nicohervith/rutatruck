"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DisputaActions({ cargaId }: { cargaId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function resolver(accion: "finalizar" | "cancelar") {
    setPending(true);
    await fetch(`/api/admin/disputas/${cargaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    router.refresh();
    setPending(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => resolver("finalizar")}
        disabled={pending}
        className="text-xs font-medium rounded-lg px-3 py-1.5 disabled:opacity-50 cursor-pointer transition-colors"
        style={{ backgroundColor: "var(--primary)", color: "#0C1E1E" }}
      >
        Finalizar viaje
      </button>
      <button
        onClick={() => resolver("cancelar")}
        disabled={pending}
        className="text-xs font-medium rounded-lg px-3 py-1.5 disabled:opacity-50 cursor-pointer transition-colors border border-red-500/30 bg-red-500/10 text-red-300"
      >
        Cancelar carga
      </button>
    </div>
  );
}
