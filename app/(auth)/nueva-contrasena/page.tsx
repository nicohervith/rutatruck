"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import LogoClickCargo from "@/app/_components/LogoClickCargo";

function NuevaContrasenaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError("El enlace no es válido.");
  }, [token]);

  const inputClass = "w-full rounded-lg border px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm";
  const inputStyle = { backgroundColor: "#0F2020", borderColor: "#1E3838" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setPending(true);
    try {
      const res = await fetch("/api/auth/nueva-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error inesperado");
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border p-8" style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}>
      {done ? (
        <div className="text-center space-y-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "var(--primary-13)" }}
          >
            <svg className="w-7 h-7" style={{ color: "var(--primary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">¡Contraseña actualizada!</h2>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-white mb-2">Nueva contraseña</h2>
          <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
            Ingresá tu nueva contraseña.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: "#9CA3AF" }}>
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  style={inputStyle}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3"
                  style={{ color: "#4B5563" }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium mb-1" style={{ color: "#9CA3AF" }}>
                Confirmar contraseña
              </label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
                style={inputStyle}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending || !token}
              className="w-full font-medium rounded-lg py-2.5 transition-colors cursor-pointer disabled:opacity-60 text-sm"
              style={{ backgroundColor: "var(--primary)", color: "#0C1E1E" }}
            >
              {pending ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function NuevaContrasenaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0C1E1E" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center">
            <LogoClickCargo size={52} />
          </Link>
        </div>
        <Suspense fallback={<div className="rounded-2xl border p-8 text-center" style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}><p style={{ color: "#6B7280" }}>Cargando...</p></div>}>
          <NuevaContrasenaForm />
        </Suspense>
      </div>
    </div>
  );
}
