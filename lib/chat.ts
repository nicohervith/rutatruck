/**
 * El chat de una carga FINALIZADA se mantiene 24h por si hace falta volver a
 * hablar (dudas post-viaje) y después se considera vencido: deja de listarse
 * y de ser accesible, igual que la disponibilidad del transportista
 * (ver lib/disponibilidad.ts) — self-heals por query, sin depender de que
 * corra un cron para "desaparecer" a tiempo.
 *
 * La limpieza física de los mensajes vencidos corre dentro del cron de
 * recordatorio-completar (no hay slot de cron libre en Vercel Hobby para uno
 * nuevo — mismo motivo que en disponibilidad).
 */

export const CHAT_RETENCION_FINALIZADA_MS = 24 * 60 * 60 * 1000;

type CargaChatEstado = { estado: string; updatedAt: Date | string };

/** ms hasta que se elimine el chat. null si no aplica (no está FINALIZADA). Negativo si ya venció. */
export function msHastaEliminarChat(carga: CargaChatEstado): number | null {
  if (carga.estado !== "FINALIZADA") return null;
  const updatedAt = new Date(carga.updatedAt).getTime();
  return updatedAt + CHAT_RETENCION_FINALIZADA_MS - Date.now();
}

export function esChatVigente(carga: CargaChatEstado): boolean {
  const restante = msHastaEliminarChat(carga);
  return restante === null || restante > 0;
}

/** Cláusula Prisma para excluir cargas cuyo chat ya venció. Mezclar con otros where vía AND. */
export function whereChatVigente() {
  const cutoff = new Date(Date.now() - CHAT_RETENCION_FINALIZADA_MS);
  return {
    OR: [{ estado: { not: "FINALIZADA" as const } }, { estado: "FINALIZADA" as const, updatedAt: { gte: cutoff } }],
  };
}

/** Texto corto para el badge de "se va a eliminar pronto". null si no aplica o ya venció. */
export function labelChatPorVencer(carga: CargaChatEstado): string | null {
  const restante = msHastaEliminarChat(carga);
  if (restante === null || restante <= 0) return null;
  const horas = Math.ceil(restante / (60 * 60 * 1000));
  return horas <= 1 ? "Se elimina en breve" : `Se elimina en ${horas}h`;
}
