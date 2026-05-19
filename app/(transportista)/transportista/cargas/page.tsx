import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBell from "../_components/NotificacionBell";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";
import Link from "next/link";
import CargasClientWrapper from "./_components/CargasClientWrapper";

export default async function TransportistasCargasPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; pago?: string }>;
}) {
  const session = await verifySession();
  const { success, pago } = await searchParams;

  const [cargasRaw, misPostulaciones, pendientesPagoRaw] = await Promise.all([
    db.carga.findMany({
      where: { estado: "ACTIVA" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        titulo: true,
        origen: true,
        origenLat: true,
        origenLng: true,
        destino: true,
        tipoCarga: true,
        tipoCargaDetalle: true,
        peso: true,
        presupuesto: true,
        fechaCarga: true,
        cantidadCamiones: true,
      },
    }),
    db.postulacion.findMany({
      where: { transportistaId: session.userId },
      select: { cargaId: true },
    }),
    db.carga.findMany({
      where: {
        transportistaAsignadoId: session.userId,
        estado: "PENDIENTE_PAGO_TRANSPORTISTA",
      },
      orderBy: { transportistaPagoDeadline: "asc" },
      select: {
        id: true,
        titulo: true,
        origen: true,
        destino: true,
        tipoCarga: true,
        presupuesto: true,
        transportistaPagoDeadline: true,
      },
    }),
  ]);

  // Serialize dates for client components
  const cargas = cargasRaw.map((c) => ({
    ...c,
    fechaCarga: c.fechaCarga.toISOString(),
  }));

  const pendientesPago = pendientesPagoRaw.map((c) => ({
    ...c,
    transportistaPagoDeadline: c.transportistaPagoDeadline?.toISOString() ?? null,
  }));

  const yaPostuladoIds = misPostulaciones.map((p: { cargaId: number }) => p.cargaId);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F5F5" }}>
      <header
        className="px-4 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#E2E8E8" }}
      >
        <Link href="/transportista/dashboard">
          <LogoClickCargo />
        </Link>
        <div className="flex items-center gap-2">
          <NotificacionBell />
          <HamburgerMenu role="transportista" />
        </div>
      </header>

      <CargasClientWrapper
        cargas={cargas}
        yaPostuladoIds={yaPostuladoIds}
        pendientesPago={pendientesPago}
        success={success}
        pago={pago}
      />
    </div>
  );
}
