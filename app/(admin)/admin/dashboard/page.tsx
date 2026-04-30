import { verifySession } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

export default async function AdminDashboard() {
  const session = await verifySession();

  if (session.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Acceso denegado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-green-700">RutaTruck</h1>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Panel de Administración
          </h2>
          <p className="text-gray-500 mt-1">
            Gestión de usuarios y configuración
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Empresas</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Transportistas</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-sm text-gray-500">Cargas totales</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
