"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import { signup } from "@/app/actions/auth";

export default function RegistroPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [showPassword, setShowPassword] = useState(false);

  const inputClass =
    "w-full rounded-xl border px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-colors";
  const inputStyle = {
    backgroundColor: "#0C1A1A",
    borderColor: "#1C3030",
    colorScheme: "dark" as const,
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ backgroundColor: "#060F0F" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <LogoClickCargo size={48} />
          </Link>
        </div>

        <h2 className="text-2xl font-black text-white mb-1">Crear cuenta</h2>
        <p className="text-sm mb-8" style={{ color: "#6B7280" }}>
          Empezá gratis, sin tarjeta de crédito
        </p>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>
              Nombre completo / Empresa
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className={inputClass}
              style={inputStyle}
              placeholder="Tu nombre o razón social"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              style={inputStyle}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                className={`${inputClass} pr-11`}
                style={inputStyle}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3.5 transition-colors hover:text-white"
                style={{ color: "#4B5563" }}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#9CA3AF" }}>
              Soy...
            </label>
            <select
              id="role"
              name="role"
              required
              defaultValue=""
              className={inputClass}
              style={inputStyle}
            >
              <option value="" disabled style={{ backgroundColor: "#0C1A1A" }}>Seleccioná tu tipo de cuenta</option>
              <option value="EMPRESA" style={{ backgroundColor: "#0C1A1A" }}>Empresa — publico cargas</option>
              <option value="TRANSPORTISTA" style={{ backgroundColor: "#0C1A1A" }}>Transportista — tengo un camión</option>
              <option value="TRANSPORTISTA_FLOTA" style={{ backgroundColor: "#0C1A1A" }}>Transportista flota — tengo 2 o más camiones</option>
            </select>
          </div>

          {state?.error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full font-bold rounded-xl py-3.5 transition-opacity cursor-pointer disabled:opacity-50 text-sm tracking-wide active:opacity-80 mt-2"
            style={{ backgroundColor: "rgba(255,255,255,0.93)", color: "#060F0F" }}
          >
            {pending ? "Creando cuenta..." : "CREAR CUENTA"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="text-sm" style={{ color: "#9CA3AF" }}>60 días gratis —</span>
          <span className="text-sm font-bold" style={{ color: "#4ADE80" }}>sin tarjeta</span>
        </div>

        <p className="mt-4 text-center text-sm" style={{ color: "#6B7280" }}>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-semibold transition-colors hover:opacity-80" style={{ color: "#4ADE80" }}>
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}
