"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactElement } from "react";
import { useNotifCount, usePrivCount } from "./EventsProvider";

type Tab = {
  href: string;
  label: string;
  showNotif?: boolean;
  showPriv?: boolean;
  icon: (active: boolean) => ReactElement;
};

const TABS: Record<"transportista" | "empresa", Tab[]> = {
  transportista: [
    {
      href: "/transportista/dashboard",
      label: "Perfil",
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      href: "/transportista/cargas",
      label: "Cargas",
      showPriv: true,
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      href: "/transportista/postulaciones",
      label: "Postulac.",
      showNotif: true,
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: "/transportista/disponibilidad",
      label: "Disponible",
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
      label: "Perfil",
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      href: "/empresa/cargas",
      label: "Cargas",
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
      href: "/empresa/transportistas",
      label: "Transp.",
      icon: (active) => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
  const notifCount = useNotifCount();
  const privCount = usePrivCount();

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
              {tab.showPriv && privCount > 0 && (
                <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                  {privCount > 9 ? "9+" : privCount}
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

      </div>
      <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </nav>
  );
}
