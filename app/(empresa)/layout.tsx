import PushNotificationSetup from "../(transportista)/transportista/_components/PushNotificationSetup";
import { BottomTabBar } from "@/app/_components/BottomTabBar";

export default function EmpresaGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PushNotificationSetup />
      <div className="pb-16 md:pb-0">{children}</div>
      <BottomTabBar role="empresa" />
    </>
  );
}
