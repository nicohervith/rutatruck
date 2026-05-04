import PushNotificationSetup from "./transportista/_components/PushNotificationSetup";

export default function TransportistaGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PushNotificationSetup />
      {children}
    </>
  );
}
