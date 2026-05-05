import PushNotificationSetup from "../(transportista)/transportista/_components/PushNotificationSetup";

export default function EmpresaGroupLayout({
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
