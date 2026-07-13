"use client";

import { useEffect, useState } from "react";

export default function VerificarEmailBanner({ emailVerified }: { emailVerified: boolean }) {
  const [verified, setVerified] = useState(emailVerified);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (verified) return null;

  async function solicitarCodigo() {
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/auth/verificar-email/solicitar", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar el código");
      if (data.alreadyVerified) {
        setVerified(true);
        return;
      }
      setOpen(true);
      setCode("");
      setCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setOpen(true);
    } finally {
      setSending(false);
    }
  }

  async function confirmarCodigo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verificar-email/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Código incorrecto");
      setVerified(true);
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={solicitarCodigo}
        disabled={sending}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-opacity active:opacity-80 disabled:opacity-60 mb-6 cursor-pointer"
        style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
      >
        <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FEF3C7" }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#92400E" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </span>
        <span className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: "#92400E" }}>
            {sending ? "Enviando código…" : "Verificá tu email"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>
            Tocá para recibir un código por email
          </p>
        </span>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#B45309" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center px-5"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => !verifying && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ backgroundColor: "#FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black text-gray-900 mb-1">Verificá tu email</h2>
            <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
              Ingresá el código de 6 dígitos que te enviamos por email. Vence en 15 minutos.
            </p>

            <form onSubmit={confirmarCodigo} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-xl border px-4 py-3 text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 text-gray-900"
                style={{ backgroundColor: "#F9FAFB", borderColor: "#E2E8E8" }}
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="w-full font-bold rounded-xl py-3.5 transition-opacity cursor-pointer disabled:opacity-50 text-sm active:opacity-80"
                style={{ backgroundColor: "var(--primary)", color: "#FFFFFF" }}
              >
                {verifying ? "Verificando…" : "Verificar"}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-semibold cursor-pointer"
                  style={{ color: "#6B7280" }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={solicitarCodigo}
                  disabled={cooldown > 0 || sending}
                  className="font-semibold cursor-pointer disabled:opacity-50"
                  style={{ color: "var(--primary)" }}
                >
                  {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
