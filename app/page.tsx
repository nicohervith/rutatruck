import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-700">RutaTruck</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="text-sm bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center">
          <span className="inline-block text-xs font-medium text-green-700 bg-green-50 rounded-full px-3 py-1 mb-6">
            Plataforma de transporte agrícola
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Conectamos empresas con{" "}
            <span className="text-green-700">transportistas del campo</span>
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-lg mx-auto">
            Publicá cargas, encontrá transportistas disponibles y coordiná
            entregas agrícolas de forma simple y segura.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registro"
              className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg px-8 py-3 transition-colors text-center"
            >
              Empezar gratis
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto border border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-lg px-8 py-3 transition-colors text-center"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Publicá cargas
            </h3>
            <p className="text-sm text-gray-500">
              Empresas publican sus necesidades de transporte fácilmente
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Conectá transportistas
            </h3>
            <p className="text-sm text-gray-500">
              Transportistas se postulan y coordinan directamente
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Pagos seguros
            </h3>
            <p className="text-sm text-gray-500">
              Pagos protegidos vía Mercado Pago integrado
            </p>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 border-t border-gray-100 text-center text-sm text-gray-400">
        © 2026 RutaTruck. Todos los derechos reservados.
      </footer>
    </div>
  );
}
