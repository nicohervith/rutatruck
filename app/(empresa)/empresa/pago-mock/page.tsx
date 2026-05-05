import Link from "next/link";

export default function PagoMockPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const ref = searchParams.ref ?? "";
  const cargaId = ref.replace("publicar_", "");

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0C1E1E" }}>
      <div
        className="rounded-xl border p-8 max-w-md w-full text-center space-y-4"
        style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
      >
        <div className="text-4xl">🧪</div>
        <h1 className="text-xl font-semibold text-white">
          Simulador de pago — Dev
        </h1>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          En producción aquí aparecería MercadoPago.
          <br />
          Carga ID:{" "}
          <code className="font-mono" style={{ color: "#2DD4BF" }}>{cargaId}</code>
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <Link
            href={`/api/pagos/success?external_reference=publicar_${cargaId}&payment_id=mock-123&status=approved`}
            className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-6 py-2.5 transition-colors"
          >
            ✅ Simular pago aprobado
          </Link>
          <Link
            href={`/api/pagos/failure?external_reference=publicar_${cargaId}&status=failure`}
            className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-6 py-2.5 transition-colors"
          >
            ❌ Simular pago fallido
          </Link>
          <Link
            href="/empresa/dashboard"
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
