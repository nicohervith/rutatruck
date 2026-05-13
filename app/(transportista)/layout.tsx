import PushNotificationSetup from "./transportista/_components/PushNotificationSetup";
import { BottomTabBar } from "@/app/_components/BottomTabBar";

export default function TransportistaGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PushNotificationSetup />
      <div className="pb-16 md:pb-0">{children}</div>
      <BottomTabBar role="transportista" />
    </>
  );
}
