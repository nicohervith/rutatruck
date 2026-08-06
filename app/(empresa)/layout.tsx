import PushNotificationSetup from "../(transportista)/transportista/_components/PushNotificationSetup";
import { AppShell } from "@/app/_components/AppShell";
import { EventsProvider } from "@/app/_components/EventsProvider";

export default function EmpresaGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventsProvider>
      <PushNotificationSetup />
      <AppShell role="empresa">{children}</AppShell>
    </EventsProvider>
  );
}
