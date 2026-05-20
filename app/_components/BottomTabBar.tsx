"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { useEffect, useState, type ReactElement } from "react";

type Tab = {
  href: string;
  label: string;
  showNotif?: boolean;
  icon: (active: boolean) => ReactElement;
};

const TABS: Record<"transportista" | "empresa", Tab[]> = {
  transportista: [
    {
      href: "/transportista/dashboard",
      label: "Inicio",
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/transportista/cargas",
      label: "Cargas",
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: "/transportista/postulaciones",
      label: "Postulaciones",
      showNotif: true,
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: "/transportista/historial",
      label: "Historial",
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ],
  empresa: [
    {
      href: "/empresa/dashboard",
      label: "Inicio",
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/empresa/cargas",
      label: "Mis cargas",
      showNotif: true,
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      href: "/empresa/cargas/nueva",
      label: "Publicar",
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      href: "/empresa/historial",
      label: "Historial",
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ],
};

function tabIsActive(tabHref: string, pathname: string): boolean {
  if (pathname === tabHref) return true;
  if (tabHref.endsWith("/nueva")) return pathname.startsWith(tabHref);
  if (tabHref.endsWith("/cargas")) {
    return pathname.startsWith(tabHref + "/") && !pathname.includes("/nueva");
  }
  return pathname.startsWith(tabHref + "/");
}

export function BottomTabBar({ role }: { role: "transportista" | "empresa" }) {
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const url =
      role === "transportista"
        ? "/api/notificaciones/count"
        : "/api/notificaciones/empresa/count";
    const fetchCount = () => {
      fetch(url)
        .then((r) => r.json())
        .then((d) => setNotifCount(d.count ?? 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, [role, pathname]);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 border-t z-50"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex">
      {TABS[role].map((tab) => {
        const active = tabIsActive(tab.href, pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 relative flex flex-col items-center justify-center py-3 gap-1 transition-colors"
            style={{ color: active ? "var(--primary)" : "#6B7280" }}
          >
            <span className="relative">
              {tab.icon(active)}
              {tab.showNotif && notifCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold leading-none">
              {tab.label}
            </span>
            {active && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: "#06342A" }}
              />
            )}
          </Link>
        );
      })}

      <form action={logout} className="flex-1">
        <button
          type="submit"
          className="w-full h-full flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors"
          style={{ color: "#6B7280" }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[10px] font-semibold leading-none">Salir</span>
        </button>
      </form>
      </div>
      <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </nav>
  );
}
