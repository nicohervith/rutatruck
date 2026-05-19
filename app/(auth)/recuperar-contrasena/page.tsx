"use client";

import { useState } from "react";
import Link from "next/link";
import LogoClickCargo from "@/app/_components/LogoClickCargo";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "w-full rounded-lg border px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm";
  const inputStyle = { backgroundColor: "#0F2020", borderColor: "#1E3838" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/recuperar-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error inesperado");
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0C1E1E" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            <LogoClickCargo size={52} />
          </Link>
        </div>

        <div className="rounded-2xl border p-8" style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}>
          {sent ? (
            <div className="text-center space-y-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: "var(--primary-13)" }}
              >
                <svg className="w-7 h-7" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Revisá tu email</h2>
              <p className="text-sm" style={{ color: "#9CA3AF" }}>
                Si existe una cuenta con ese email, vas a recibir un enlace para restablecer tu contraseña. Vence en 1 hora.
              </p>
              <Link
                href="/login"
                className="inline-block text-sm font-medium transition-colors"
                style={{ color: "var(--primary)" }}
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Recuperar contraseña</h2>
              <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
                Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "#9CA3AF" }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className={inputClass}
                    style={inputStyle}
                    placeholder="tu@email.com"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full font-medium rounded-lg py-2.5 transition-colors cursor-pointer disabled:opacity-60 text-sm"
                  style={{ backgroundColor: "var(--primary)", color: "#0C1E1E" }}
                >
                  {pending ? "Enviando..." : "Enviar enlace"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm" style={{ color: "#6B7280" }}>
                <Link href="/login" className="font-medium transition-colors" style={{ color: "var(--primary)" }}>
                  ← Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
