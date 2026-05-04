import Link from "next/link";

export default function PagoMockPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const ref = searchParams.ref ?? "";
  // ref viene como "publicar_<id>"
  const cargaId = ref.replace("publicar_", "");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-100 p-8 max-w-md w-full text-center space-y-4">
        <div className="text-4xl">🧪</div>
        <h1 className="text-xl font-semibold text-gray-800">
          Simulador de pago — Dev
        </h1>
        <p className="text-sm text-gray-500">
          En producción aquí aparecería MercadoPago.
          <br />
          Carga ID: <code className="text-brand-navy font-mono">{cargaId}</code>
        </p>

        <div className="flex flex-col gap-3 pt-2">
          {/* Simula pago aprobado */}
          <Link
            href={`/api/pagos/success?external_reference=publicar_${cargaId}&payment_id=mock-123&status=approved`}
            className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-6 py-2.5 transition-colors"
          >
            ✅ Simular pago aprobado
          </Link>

          {/* Simula pago fallido */}
          <Link
            href={`/api/pagos/failure?external_reference=publicar_${cargaId}&status=failure`}
            className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-6 py-2.5 transition-colors"
          >
            ❌ Simular pago fallido
          </Link>

          <Link
            href="/empresa/dashboard"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}
