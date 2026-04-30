import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import PostularseButton from "./_components/PostularseButton";

const TIPO_LABELS: Record<string, string> = {
  granos: "Granos",
  frutas: "Frutas",
  verduras: "Verduras",
  animales: "Animales",
  otro: "Otro",
};

export default async function CargaPublicaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const { id } = await params;

  const cargaId = parseInt(id);
  if (isNaN(cargaId)) redirect("/transportista/cargas");

  const [carga, miPostulacion] = await Promise.all([
    db.carga.findUnique({
      where: { id: cargaId, estado: "ACTIVA" },
    }),
    db.postulacion.findUnique({
      where: {
        cargaId_transportistaId: {
          cargaId,
          transportistaId: session.userId,
        },
      },
    }),
  ]);

  if (!carga) redirect("/transportista/cargas");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/transportista/dashboard" className="text-xl font-bold text-green-700">
          RutaTruck
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/transportista/cargas" className="text-sm text-gray-500 hover:text-gray-700 inline-block mb-3">
            ← Cargas disponibles
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">{carga.titulo}</h1>
          <p className="text-gray-500 mt-1">{carga.origen} → {carga.destino}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="font-medium text-gray-800 mb-4">Detalles de la carga</h2>
          <div className="space-y-2">
            {[
              ["Tipo", TIPO_LABELS[carga.tipoCarga] ?? carga.tipoCarga],
              carga.peso !== null && ["Peso", `${carga.peso} toneladas`],
              carga.volumen !== null && ["Volumen", `${carga.volumen} m³`],
              carga.presupuesto !== null && ["Presupuesto", `$${carga.presupuesto.toLocaleString("es-AR")}`],
              ["Fecha de carga", carga.fechaCarga.toLocaleDateString("es-AR")],
              carga.fechaEntrega && ["Fecha de entrega", carga.fechaEntrega.toLocaleDateString("es-AR")],
              carga.tiempoEstimado && ["Tiempo estimado", carga.tiempoEstimado],
              carga.descripcion && ["Descripción", carga.descripcion],
            ].filter(Boolean).map(([label, value]) => (
              <div key={label as string} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label as string}</span>
                <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value as string}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="font-medium text-gray-800 mb-4">Contacto</h2>
          <p className="text-sm font-medium text-gray-800">{carga.contactoNombre}</p>
          <p className="text-sm text-gray-600">{carga.contactoTelefono}</p>
          <p className="text-sm text-gray-600">{carga.contactoEmail}</p>
        </div>

        <PostularseButton cargaId={carga.id} miPostulacion={miPostulacion} />
      </main>
    </div>
  );
}
