import Link from "next/link";
import LogoClickCargo from "@/app/_components/LogoClickCargo";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ backgroundColor: "#0C1E1E" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-8">

        {/* Logo */}
        <div className="flex justify-center">
          <LogoClickCargo size={52} />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Elegí tu perfil</h1>
          <div className="w-8 h-0.5 mx-auto mb-3" style={{ backgroundColor: "#2DD4BF" }} />
          <p style={{ color: "#9CA3AF" }} className="text-sm">
            Seleccioná cómo querés usar ClickCargo
          </p>
        </div>

        {/* Role cards */}
        <div className="flex flex-col gap-3">
          <Link
            href="/registro?rol=transportista"
            className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
            style={{ backgroundColor: "#112424", borderColor: "#2DD4BF33" }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#2DD4BF1A" }}
            >
              <svg className="w-7 h-7" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0h1m4-8h1a2 2 0 012 2v6h-3M13 8h5l2 4" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-white tracking-wide text-sm">TRANSPORTISTA</p>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                Encontrá cargas y viajes disponibles
              </p>
            </div>
            <svg className="w-5 h-5 shrink-0" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/registro?rol=empresa"
            className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
            style={{ backgroundColor: "#0F1E2E", borderColor: "#3B82F633" }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#3B82F61A" }}
            >
              <svg className="w-7 h-7" style={{ color: "#60A5FA" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-white tracking-wide text-sm">EMPRESA</p>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                Publicá cargas y conectá transportistas
              </p>
            </div>
            <svg className="w-5 h-5 shrink-0" style={{ color: "#60A5FA" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-3 w-fit mx-auto">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#2DD4BF1A" }}
            >
              <svg className="w-4 h-4" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Publicá cargas</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Publicá tus viajes en minutos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#2DD4BF1A" }}
            >
              <svg className="w-4 h-4" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Conecta transportistas</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Encontrá el camión ideal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#2DD4BF1A" }}
            >
              <svg className="w-4 h-4" style={{ color: "#2DD4BF" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Pagos seguros</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Transacciones protegidas</p>
            </div>
          </div>
        </div>

        {/* Login section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "#1E3838" }} />
            <p className="text-xs" style={{ color: "#6B7280" }}>¿Ya tenés cuenta?</p>
            <div className="flex-1 h-px" style={{ backgroundColor: "#1E3838" }} />
          </div>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="flex-1 py-3 rounded-xl text-sm font-bold text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#2DD4BF", color: "#0C1E1E" }}
            >
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-center border transition-colors"
              style={{ borderColor: "#2DD4BF44", color: "#2DD4BF" }}
            >
              Registrarse
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
