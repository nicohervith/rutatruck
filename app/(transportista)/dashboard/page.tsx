import { verifySession } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

export default async function TransportistaDashboard() {
  const session = await verifySession();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-700">RutaTruck</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Panel de Transportista
          </h2>
          <p className="text-gray-500 mt-1">
            Encontrá cargas disponibles y gestioná tus viajes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Cargas disponibles</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Mis postulaciones</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Viajes completados</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-400 mb-4">No hay cargas disponibles aún</p>
          <button className="bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg px-6 py-2.5 transition-colors">
            Ver todas las cargas
          </button>
        </div>
      </main>
    </div>
  );
}
