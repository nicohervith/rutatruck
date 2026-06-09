"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotifCount } from "@/app/_components/EventsProvider";

type Notif = {
  tipo: "confirmacion" | "postulacion";
  cargaId: number;
  titulo: string;
  origen: string;
  destino: string;
  extra: string | null;
};

export default function NotificacionBellEmpresa() {
  const count = useNotifCount();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, right: 8 });
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleOpen() {
    if (open) { setOpen(false); return; }
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 8, right: 8 });
    }
    setOpen(true);
    setLoading(true);
    try {
      const data = await fetch("/api/notificaciones/empresa/list").then((r) => r.json());
      setNotifs(data.notificaciones ?? []);
    } catch {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleItemClick(cargaId: number) {
    setOpen(false);
    await fetch("/api/notificaciones/empresa/mark-seen", { method: "POST" });
    router.push(`/empresa/cargas/${cargaId}`);
  }

  async function handleMarkAll() {
    await fetch("/api/notificaciones/empresa/mark-seen", { method: "POST" });
    setNotifs([]);
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative inline-flex items-center p-1 transition-opacity hover:opacity-80"
        style={{ color: "#C4DCDC" }}
        aria-label="Notificaciones"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-gray-900 leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed left-1/2 -translate-x-1/2 w-80 max-w-[calc(100vw-16px)] rounded-xl border shadow-xl z-50 overflow-hidden"
          style={{ backgroundColor: "#112424", borderColor: "#1E3838", top: popupPos.top }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "#1E3838" }}
          >
            <span className="text-sm font-semibold" style={{ color: "#C4DCDC" }}>
              Notificaciones
            </span>
            {notifs.some((n) => n.tipo === "postulacion") && (
              <button
                onClick={handleMarkAll}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "#6B7280" }}
              >
                Marcar todas como vistas
              </button>
            )}
          </div>

          {loading ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: "#6B7280" }}>
              Cargando...
            </div>
          ) : notifs.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm" style={{ color: "#6B7280" }}>
              Sin notificaciones nuevas
            </div>
          ) : (
            <ul>
              {notifs.map((n, i) => (
                <li key={i} className="border-b last:border-b-0" style={{ borderColor: "#1E3838" }}>
                  <button
                    onClick={() => handleItemClick(n.cargaId)}
                    className="w-full text-left px-4 py-3 transition-colors hover:bg-white/5"
                  >
                    <p className="text-sm font-medium" style={{ color: "#E5E7EB" }}>
                      {n.tipo === "confirmacion"
                        ? "Viaje completado — confirmá o disputá"
                        : `Nueva postulación${n.extra ? ` de ${n.extra}` : ""}`}
                    </p>
                    <p className="text-xs mt-0.5 font-semibold" style={{ color: "var(--primary)" }}>
                      {n.titulo}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                      {n.origen} → {n.destino}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t" style={{ borderColor: "#1E3838" }}>
            <Link
              href="/empresa/cargas"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-xs text-center transition-opacity hover:opacity-70"
              style={{ color: "#6B7280" }}
            >
              Ver todas las cargas →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
