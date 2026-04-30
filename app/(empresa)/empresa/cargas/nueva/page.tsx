import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import NuevaCargaForm from "./_components/NuevaCargaForm";

export default async function NuevaCargaPage() {
  const session = await verifySession();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, phone: true },
  });

  return (
    <NuevaCargaForm
      contactoDefecto={{
        nombre: user?.name ?? "",
        email: user?.email ?? "",
        telefono: user?.phone ?? "",
      }}
    />
  );
}
