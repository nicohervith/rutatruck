import { db } from "@/lib/db";
import { esChatVigente, whereChatVigente, labelChatPorVencer, CHAT_RETENCION_FINALIZADA_MS } from "@/lib/chat";

export async function crearMensaje(cargaId: number, autorId: string, cuerpo: string) {
  return db.mensaje.create({ data: { cargaId, autorId, cuerpo } });
}

export async function findMensajesDeCarga(cargaId: number, sinceId?: number, limit = 200) {
  return db.mensaje.findMany({
    where: { cargaId, ...(sinceId ? { id: { gt: sinceId } } : {}) },
    orderBy: { creadoEn: "asc" },
    take: limit,
  });
}

export async function marcarLeidos(cargaId: number, userId: string) {
  const { count } = await db.mensaje.updateMany({
    where: { cargaId, autorId: { not: userId }, leidoEn: null },
    data: { leidoEn: new Date() },
  });
  return count;
}

export async function countMensajesNoLeidos(userId: string, role: "empresa" | "transportista") {
  return db.mensaje.count({
    where: {
      autorId: { not: userId },
      leidoEn: null,
      carga: role === "empresa" ? { empresaId: userId } : { transportistaAsignadoId: userId },
    },
  });
}

/** Carga con datos de contraparte, solo si userId es la empresa o el transportista asignado y el chat no venció. */
export async function findCargaParaChat(cargaId: number, userId: string) {
  const carga = await db.carga.findUnique({
    where: { id: cargaId },
    select: {
      id: true,
      titulo: true,
      origen: true,
      destino: true,
      estado: true,
      updatedAt: true,
      empresaId: true,
      transportistaAsignadoId: true,
      empresa: { select: { name: true } },
      transportistaAsignado: { select: { name: true } },
    },
  });
  if (!carga || !carga.transportistaAsignadoId) return null;
  if (carga.empresaId !== userId && carga.transportistaAsignadoId !== userId) return null;
  if (!esChatVigente(carga)) return null;
  return carga;
}

/** Borra los mensajes de cargas FINALIZADA hace más de 24h. Se llama desde un cron ya existente. */
export async function eliminarMensajesFinalizadosVencidos() {
  const cutoff = new Date(Date.now() - CHAT_RETENCION_FINALIZADA_MS);
  const { count } = await db.mensaje.deleteMany({
    where: { carga: { estado: "FINALIZADA", updatedAt: { lt: cutoff } } },
  });
  return count;
}

export type ConversacionResumen = {
  cargaId: number;
  titulo: string;
  origen: string;
  destino: string;
  estado: string;
  contraparteNombre: string;
  ultimoMensaje: string | null;
  ultimoMensajeEn: Date;
  noLeidos: number;
  avisoVencimiento: string | null;
};

export async function findConversaciones(
  userId: string,
  role: "empresa" | "transportista",
): Promise<ConversacionResumen[]> {
  const cargas = await db.carga.findMany({
    where: {
      ...(role === "empresa"
        ? { empresaId: userId, transportistaAsignadoId: { not: null } }
        : { transportistaAsignadoId: userId }),
      ...whereChatVigente(),
    },
    select: {
      id: true,
      titulo: true,
      origen: true,
      destino: true,
      estado: true,
      updatedAt: true,
      empresa: { select: { name: true } },
      transportistaAsignado: { select: { name: true } },
    },
  });

  if (cargas.length === 0) return [];

  const mensajes = await db.mensaje.findMany({
    where: { cargaId: { in: cargas.map((c) => c.id) } },
    orderBy: { creadoEn: "desc" },
    select: { cargaId: true, cuerpo: true, autorId: true, creadoEn: true, leidoEn: true },
  });

  const ultimoPorCarga = new Map<number, (typeof mensajes)[number]>();
  const noLeidosPorCarga = new Map<number, number>();
  for (const m of mensajes) {
    if (!ultimoPorCarga.has(m.cargaId)) ultimoPorCarga.set(m.cargaId, m);
    if (m.autorId !== userId && m.leidoEn === null) {
      noLeidosPorCarga.set(m.cargaId, (noLeidosPorCarga.get(m.cargaId) ?? 0) + 1);
    }
  }

  return cargas
    .map((c) => {
      const ultimo = ultimoPorCarga.get(c.id);
      return {
        cargaId: c.id,
        titulo: c.titulo,
        origen: c.origen,
        destino: c.destino,
        estado: c.estado,
        contraparteNombre:
          role === "empresa" ? (c.transportistaAsignado?.name ?? "Transportista") : c.empresa.name,
        ultimoMensaje: ultimo?.cuerpo ?? null,
        ultimoMensajeEn: ultimo?.creadoEn ?? c.updatedAt,
        noLeidos: noLeidosPorCarga.get(c.id) ?? 0,
        avisoVencimiento: labelChatPorVencer(c),
      };
    })
    .sort((a, b) => b.ultimoMensajeEn.getTime() - a.ultimoMensajeEn.getTime());
}
