"use client";

import { useEffect, useRef, useState } from "react";

export type Mensaje = {
  id: number;
  autorId: string;
  cuerpo: string;
  creadoEn: string;
  leidoEn: string | null;
};

interface Props {
  cargaId: number;
  currentUserId: string;
  initialMensajes: Mensaje[];
}

export default function ChatThread({ cargaId, currentUserId, initialMensajes }: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(initialMensajes);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [otroEscribiendo, setOtroEscribiendo] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef(
    initialMensajes.length > 0 ? initialMensajes[initialMensajes.length - 1].id : 0,
  );
  const escribiendoTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ultimoTypingEnviadoRef = useRef(0);

  function mergeMensajes(nuevos: Mensaje[]) {
    if (nuevos.length === 0) return;
    setMensajes((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const merged = [...prev, ...nuevos.filter((m) => !ids.has(m.id))];
      merged.sort((a, b) => a.id - b.id);
      return merged;
    });
    const maxId = Math.max(...nuevos.map((m) => m.id));
    if (maxId > lastIdRef.current) lastIdRef.current = maxId;
  }

  useEffect(() => {
    let es: EventSource;
    let retryId: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource(`/api/conversaciones/${cargaId}/stream?after=${lastIdRef.current}`);

      es.addEventListener("mensajes", (e: MessageEvent) => {
        mergeMensajes(JSON.parse(e.data) as Mensaje[]);
      });

      es.addEventListener("typing", (e: MessageEvent) => {
        const { autorId } = JSON.parse(e.data) as { autorId: string };
        if (autorId === currentUserId) return;
        setOtroEscribiendo(true);
        clearTimeout(escribiendoTimeoutRef.current);
        escribiendoTimeoutRef.current = setTimeout(() => setOtroEscribiendo(false), 3500);
      });

      es.addEventListener("leido", (e: MessageEvent) => {
        const { lectorId, en } = JSON.parse(e.data) as { lectorId: string; en: string };
        if (lectorId === currentUserId) return;
        setMensajes((prev) =>
          prev.map((m) => (m.autorId === currentUserId && !m.leidoEn ? { ...m, leidoEn: en } : m)),
        );
      });

      es.onerror = () => {
        es.close();
        retryId = setTimeout(connect, 3000);
      };
    }

    connect();
    return () => {
      es?.close();
      clearTimeout(retryId);
      clearTimeout(escribiendoTimeoutRef.current);
    };
  }, [cargaId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes.length]);

  function handleTextoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTexto(e.target.value);
    const ahora = Date.now();
    if (ahora - ultimoTypingEnviadoRef.current < 2000) return;
    ultimoTypingEnviadoRef.current = ahora;
    fetch(`/api/conversaciones/${cargaId}/typing`, { method: "POST" }).catch(() => {});
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const cuerpo = texto.trim();
    if (!cuerpo) return;
    setEnviando(true);
    setError("");
    try {
      const res = await fetch(`/api/conversaciones/${cargaId}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuerpo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      mergeMensajes([data.mensaje as Mensaje]);
      setTexto("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {mensajes.length === 0 && (
          <p className="text-center text-sm py-10" style={{ color: "#9CA3AF" }}>
            Todavía no hay mensajes. Escribí el primero para coordinar el viaje.
          </p>
        )}
        {mensajes.map((m) => {
          const esMio = m.autorId === currentUserId;
          return (
            <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm"
                style={
                  esMio
                    ? { backgroundColor: "var(--primary)", color: "#FFFFFF" }
                    : { backgroundColor: "#FFFFFF", color: "#111827", border: "1px solid #E2E8E8" }
                }
              >
                <p className="whitespace-pre-wrap break-words">{m.cuerpo}</p>
                <p className="text-[10px] mt-1 flex items-center justify-end gap-1" style={{ opacity: 0.7 }}>
                  {new Date(m.creadoEn).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  {esMio && (
                    <span style={{ color: m.leidoEn ? "#7DD3FC" : "inherit" }}>
                      {m.leidoEn ? "✓✓" : "✓"}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        {otroEscribiendo && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-2.5 text-sm italic"
              style={{ backgroundColor: "#FFFFFF", color: "#6B7280", border: "1px solid #E2E8E8" }}
            >
              Escribiendo...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="px-4 pb-1 text-xs flex-shrink-0" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}

      <form
        onSubmit={handleSend}
        className="flex-shrink-0 border-t px-4 py-3 flex gap-2"
        style={{ borderColor: "#E2E8E8", backgroundColor: "#FFFFFF" }}
      >
        <input
          type="text"
          value={texto}
          onChange={handleTextoChange}
          placeholder="Escribí un mensaje..."
          className="flex-1 rounded-full border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: "#E2E8E8", color: "#111827" }}
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "var(--primary)", color: "#FFFFFF" }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
