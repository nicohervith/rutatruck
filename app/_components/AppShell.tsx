"use client";

import { usePathname } from "next/navigation";
import { BottomTabBar } from "./BottomTabBar";

// Un hilo de chat abierto se ve full-screen, sin la tab bar de abajo — como
// WhatsApp. La barra de arriba (banner de disponibilidad, etc.) también se
// oculta ahí para que la conversación ocupe toda la pantalla.
const FULLSCREEN_PREFIXES = ["/empresa/conversaciones/", "/transportista/conversaciones/"];

interface Props {
  role: "empresa" | "transportista";
  banner?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ role, banner, children }: Props) {
  const pathname = usePathname();
  const fullscreen = FULLSCREEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (fullscreen) {
    return <>{children}</>;
  }

  return (
    <>
      {banner}
      <div className="pb-16 md:pb-0">{children}</div>
      <BottomTabBar role={role} />
    </>
  );
}
