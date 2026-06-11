"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DISMISSED_KEY = "pwa-dismissed-ts";
const REDISPLAY_DAYS = 7;

export default function InstallPWA() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ts = localStorage.getItem(DISMISSED_KEY);
    const recentlyDismissed = ts && (Date.now() - Number(ts)) / 86400000 < REDISPLAY_DAYS;
    if (
      recentlyDismissed ||
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone
    ) return;

    const ua = window.navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") dismiss();
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex items-center gap-3"
      onClick={isIOS ? () => router.push("/descargar") : undefined}
      style={isIOS ? { cursor: "pointer" } : undefined}
    >
      <div className="w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">Instalá ClickCargo</p>
        {isIOS ? (
          <p className="text-xs text-gray-500 mt-0.5">
            Tocá aquí para ver cómo instalarlo →
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-0.5">Accedé más rápido desde tu pantalla de inicio</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="text-xs font-medium bg-brand-navy text-white px-3 py-1.5 rounded-lg hover:bg-brand-navy-dark transition-colors"
          >
            Instalar
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          aria-label="Cerrar"
          className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
