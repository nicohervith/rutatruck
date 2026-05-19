import Link from "next/link";

export default async function PagoMockTransportistaPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref: refParam } = await searchParams;
  const ref = refParam ?? "";
  const cargaId = ref.replace("comision_carga_", "");

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#F2F5F5" }}>
      <div
        className="rounded-xl border p-8 max-w-md w-full text-center space-y-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
      >
        <div className="text-4xl">🧪</div>
        <h1 className="text-xl font-semibold text-gray-900">
          Simulador de pago — Dev
        </h1>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          Pago de comisión para carga{" "}
          <code className="font-mono" style={{ color: "var(--primary)" }}>{cargaId}</code>
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <a
            href={`/api/pagos/success?external_reference=comision_carga_${cargaId}&payment_id=mock-123&status=approved`}
            className="bg-green-600 hover:bg-green-700 text-gray-900 font-medium rounded-lg px-6 py-2.5 transition-colors"
          >
            ✅ Simular pago aprobado
          </a>
          <a
            href={`/api/pagos/failure?external_reference=comision_carga_${cargaId}&status=failure`}
            className="bg-red-500 hover:bg-red-600 text-gray-900 font-medium rounded-lg px-6 py-2.5 transition-colors"
          >
            ❌ Simular pago fallido
          </a>
          <Link
            href={`/transportista/cargas/${cargaId}`}
            className="text-sm transition-colors"
            style={{ color: "#4B5563" }}
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
