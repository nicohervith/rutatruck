import Link from "next/link";
import LogoClickCargo from "@/app/_components/LogoClickCargo";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0C1E1E" }}>
      <header className="px-6 py-4 flex items-center justify-between">
        <LogoClickCargo />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white font-medium transition-colors cursor-pointer"
          >
            Ingresar
          </Link>
          <Link
            href="/registro"
            className="text-sm border border-white/20 hover:border-white/40 text-white font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center">
          <span
            className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-4 py-1.5 mb-8 border"
            style={{ color: "#2DD4BF", borderColor: "#2DD4BF44" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#2DD4BF" }}
            />
            RED INTEGRAL DE CARGAS
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Conectamos empresas con{" "}
            <span style={{ color: "#2DD4BF" }}>transportistas</span>
            {" "}de carga
          </h1>

          <div className="w-10 h-0.5 mx-auto mb-6" style={{ backgroundColor: "#2DD4BF" }} />

          <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: "#9CA3AF" }}>
            Publicá cargas, encontrá transportistas disponibles y coordiná
            entregas de forma{" "}
            <span style={{ color: "#2DD4BF" }} className="font-medium">
              simple y segura.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/registro"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white hover:bg-gray-100 font-bold rounded-xl px-8 py-3.5 transition-colors text-center"
              style={{ color: "#0C1E1E" }}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: "#0C1E1E" }}
              >
                →
              </span>
              EMPEZAR GRATIS
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border font-semibold rounded-xl px-8 py-3.5 transition-colors text-center"
              style={{ borderColor: "#2DD4BF44", color: "#2DD4BF" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              YA TENGO CUENTA
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#2DD4BF1A" }}
            >
              <svg className="w-6 h-6" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Publicá cargas</h3>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Empresas publican sus necesidades de transporte fácilmente
            </p>
          </div>
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#2DD4BF1A" }}
            >
              <svg className="w-6 h-6" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Conectá transportistas</h3>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Transportistas se postulan y coordinan directamente
            </p>
          </div>
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#2DD4BF1A" }}
            >
              <svg className="w-6 h-6" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Pagos seguros</h3>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Pagos protegidos vía Mercado Pago integrado
            </p>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-sm" style={{ color: "#374151" }}>
        © 2026 ClickCargo. Todos los derechos reservados.
      </footer>
    </div>
  );
}
