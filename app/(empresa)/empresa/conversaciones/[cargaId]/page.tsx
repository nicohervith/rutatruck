import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import LogoClickCargo from "@/app/_components/LogoClickCargo";
import NotificacionBellEmpresa from "../../_components/NotificacionBellEmpresa";
import { HamburgerMenu } from "@/app/_components/HamburgerMenu";
import ChatThread from "@/app/_components/ChatThread";
import { findCargaParaChat, findMensajesDeCarga, marcarLeidos } from "@/lib/repositories/mensaje.repository";

export default async function EmpresaConversacionPage({
  params,
}: {
  params: Promise<{ cargaId: string }>;
}) {
  const session = await verifySession();
  const { cargaId: cargaIdParam } = await params;
  const cargaId = parseInt(cargaIdParam);
  if (isNaN(cargaId)) redirect("/empresa/conversaciones");

  const carga = await findCargaParaChat(cargaId, session.userId);
  if (!carga || carga.empresaId !== session.userId) redirect("/empresa/conversaciones");

  const [mensajes] = await Promise.all([
    findMensajesDeCarga(cargaId),
    marcarLeidos(cargaId, session.userId),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F5F5" }}>
      <header
        className="sticky top-0 z-30 border-b px-5 py-3.5 flex items-center justify-between"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <LogoClickCargo />
        <div className="flex items-center gap-2">
          <NotificacionBellEmpresa />
          <HamburgerMenu role="empresa" isMultiRole={session.role === "EMPRESA_TRANSPORTISTA"} />
        </div>
      </header>

      <div
        className="border-b px-5 py-3 flex items-center gap-3"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
      >
        <Link
          href="/empresa/conversaciones"
          className="flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0"
          style={{ borderColor: "var(--primary)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--primary)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {carga.transportistaAsignado?.name ?? "Transportista"}
          </p>
          <Link
            href={`/empresa/cargas/${carga.id}`}
            className="text-xs truncate block transition-opacity hover:opacity-80"
            style={{ color: "var(--primary)" }}
          >
            {carga.titulo}
          </Link>
        </div>
      </div>

      <ChatThread
        cargaId={carga.id}
        currentUserId={session.userId}
        initialMensajes={mensajes.map((m) => ({
          id: m.id,
          autorId: m.autorId,
          cuerpo: m.cuerpo,
          creadoEn: m.creadoEn.toISOString(),
        }))}
      />
    </div>
  );
}
