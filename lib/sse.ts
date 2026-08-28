import { db } from "./db";
import { countMensajesNoLeidos } from "./repositories/mensaje.repository";

type Ctrl = ReadableStreamDefaultController<Uint8Array>;

const subs = new Map<string, Set<Ctrl>>();
const enc = new TextEncoder();

export function sseSubscribe(userId: string, ctrl: Ctrl) {
  if (!subs.has(userId)) subs.set(userId, new Set());
  subs.get(userId)!.add(ctrl);
}

export function sseUnsubscribe(userId: string, ctrl: Ctrl) {
  const s = subs.get(userId);
  if (!s) return;
  s.delete(ctrl);
  if (s.size === 0) subs.delete(userId);
}

function ssePush(userId: string, data: unknown) {
  const s = subs.get(userId);
  if (!s?.size) return;
  const chunk = enc.encode(`event: update\ndata: ${JSON.stringify(data)}\n\n`);
  for (const ctrl of [...s]) {
    try { ctrl.enqueue(chunk); }
    catch { s.delete(ctrl); }
  }
}

/**
 * Pub/sub separado para hilos de chat abiertos, keyed por cargaId en vez de
 * userId. Igual que `subs`, vive en memoria de una sola instancia serverless
 * — el push cross-instancia puede no llegar, por eso el stream de chat
 * (app/api/conversaciones/[cargaId]/stream) también re-consulta la DB en
 * cada tick: esto es solo el atajo cuando cae en la misma instancia.
 */
const chatSubs = new Map<number, Set<Ctrl>>();

export function chatSubscribe(cargaId: number, ctrl: Ctrl) {
  if (!chatSubs.has(cargaId)) chatSubs.set(cargaId, new Set());
  chatSubs.get(cargaId)!.add(ctrl);
}

export function chatUnsubscribe(cargaId: number, ctrl: Ctrl) {
  const s = chatSubs.get(cargaId);
  if (!s) return;
  s.delete(ctrl);
  if (s.size === 0) chatSubs.delete(cargaId);
}

/** `mensajes` es un array para compartir el mismo evento SSE que usa el polling en stream/route.ts. */
export function chatPush(cargaId: number, mensajes: unknown[]) {
  const s = chatSubs.get(cargaId);
  if (!s?.size) return;
  const chunk = enc.encode(`event: mensajes\ndata: ${JSON.stringify(mensajes)}\n\n`);
  for (const ctrl of [...s]) {
    try { ctrl.enqueue(chunk); }
    catch { s.delete(ctrl); }
  }
}

/** Señal efímera "está escribiendo": no se persiste, solo se relaya a quien tenga el hilo abierto en esta misma instancia. */
export function chatPushTyping(cargaId: number, autorId: string) {
  const s = chatSubs.get(cargaId);
  if (!s?.size) return;
  const chunk = enc.encode(`event: typing\ndata: ${JSON.stringify({ autorId })}\n\n`);
  for (const ctrl of [...s]) {
    try { ctrl.enqueue(chunk); }
    catch { s.delete(ctrl); }
  }
}

/** Avisa que `lectorId` marcó como leídos los mensajes de la contraparte, para actualizar el check en el emisor. */
export function chatPushLeido(cargaId: number, lectorId: string, en: string) {
  const s = chatSubs.get(cargaId);
  if (!s?.size) return;
  const chunk = enc.encode(`event: leido\ndata: ${JSON.stringify({ lectorId, en })}\n\n`);
  for (const ctrl of [...s]) {
    try { ctrl.enqueue(chunk); }
    catch { s.delete(ctrl); }
  }
}

async function perfilIncompleto(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true, emailVerified: true },
  });
  return !user || !user.phone || !user.emailVerified;
}

export async function notifyTransportista(userId: string, extra?: Record<string, unknown>) {
  const [count, postulaciones, privadas, incompleto, mensajesNoLeidos] = await Promise.all([
    db.postulacion.count({
      where: { transportistaId: userId, estado: "ACEPTADA", vistaTransportista: false },
    }),
    db.postulacion.findMany({
      where: { transportistaId: userId },
      select: { id: true, estado: true, carga: { select: { estado: true } } },
      orderBy: { id: "asc" },
    }),
    db.carga.count({
      where: { transportistaDestinadoId: userId, esPrivada: true, estado: "ACTIVA" },
    }),
    perfilIncompleto(userId),
    countMensajesNoLeidos(userId, "transportista"),
  ]);
  const hash = [
    ...postulaciones.map((p) => `${p.id}:${p.estado}:${p.carga.estado}`),
    `priv:${privadas}`,
    `msj:${mensajesNoLeidos}`,
  ].join(",");
  ssePush(userId, { count, privCount: privadas, hash, perfilIncompleto: incompleto, mensajesNoLeidos, ...extra });
}

export async function notifyEmpresa(userId: string, extra?: Record<string, unknown>) {
  const [enConfirmacion, postulacionesNuevas, incompleto, mensajesNoLeidos] = await Promise.all([
    db.carga.count({ where: { empresaId: userId, estado: "EN_CONFIRMACION" } }),
    db.postulacion.count({
      where: { carga: { empresaId: userId }, estado: "PENDIENTE", vistaEmpresa: false },
    }),
    perfilIncompleto(userId),
    countMensajesNoLeidos(userId, "empresa"),
  ]);
  const hash = [`conf:${enConfirmacion}`, `post:${postulacionesNuevas}`, `msj:${mensajesNoLeidos}`].join(",");
  ssePush(userId, {
    count: enConfirmacion + postulacionesNuevas,
    hash,
    perfilIncompleto: incompleto,
    mensajesNoLeidos,
    ...extra,
  });
}

/** Total de pendientes del lado empresa, para el badge del switcher de rol en cuentas duales. */
export async function totalPendienteEmpresa(userId: string): Promise<number> {
  const [enConfirmacion, postulacionesNuevas, mensajesNoLeidos] = await Promise.all([
    db.carga.count({ where: { empresaId: userId, estado: "EN_CONFIRMACION" } }),
    db.postulacion.count({
      where: { carga: { empresaId: userId }, estado: "PENDIENTE", vistaEmpresa: false },
    }),
    countMensajesNoLeidos(userId, "empresa"),
  ]);
  return enConfirmacion + postulacionesNuevas + mensajesNoLeidos;
}

/** Total de pendientes del lado transportista, para el badge del switcher de rol en cuentas duales. */
export async function totalPendienteTransportista(userId: string): Promise<number> {
  const [count, privadas, mensajesNoLeidos] = await Promise.all([
    db.postulacion.count({
      where: { transportistaId: userId, estado: "ACEPTADA", vistaTransportista: false },
    }),
    db.carga.count({
      where: { transportistaDestinadoId: userId, esPrivada: true, estado: "ACTIVA" },
    }),
    countMensajesNoLeidos(userId, "transportista"),
  ]);
  return count + privadas + mensajesNoLeidos;
}
