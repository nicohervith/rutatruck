import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import NuevaCargaForm from "./_components/NuevaCargaForm";

export default async function NuevaCargaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await verifySession();
  const { error } = await searchParams;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, phone: true },
  });

  const precioPublicacion = parseFloat(process.env.MP_PRECIO_PUBLICACION ?? "500");

  return (
    <NuevaCargaForm
      contactoDefecto={{
        nombre: user?.name ?? "",
        email: user?.email ?? "",
        telefono: user?.phone ?? "",
      }}
      precioPublicacion={precioPublicacion}
      errorInicial={
        error === "pago_cancelado"
          ? "El pago fue cancelado. Podés intentarlo nuevamente."
          : undefined
      }
    />
  );
}
