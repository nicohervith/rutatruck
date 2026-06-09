import PushNotificationSetup from "./transportista/_components/PushNotificationSetup";
import { BottomTabBar } from "@/app/_components/BottomTabBar";
import { EventsProvider } from "@/app/_components/EventsProvider";
import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import Link from "next/link";

async function DisponibleBanner() {
  const session = await getSession();
  if (!session) return null;
  const disp = await db.disponibilidadTransportista.findFirst({
    where: { transportistaId: session.userId, activo: true },
    select: { id: true },
  });
  if (!disp) return null;
  return (
    <Link
      href="/transportista/disponibilidad"
      className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white"
      style={{ backgroundColor: "#166534" }}
    >
      <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
      Estás marcado como Disponible · Tocar para gestionar
    </Link>
  );
}

export default function TransportistaGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventsProvider>
      <PushNotificationSetup />
      <DisponibleBanner />
      <div className="pb-16 md:pb-0">{children}</div>
      <BottomTabBar role="transportista" />
    </EventsProvider>
  );
}
