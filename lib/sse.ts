import { db } from "./db";

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

export async function notifyTransportista(userId: string) {
  const [count, postulaciones, privadas] = await Promise.all([
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
  ]);
  const hash = [
    ...postulaciones.map((p) => `${p.id}:${p.estado}:${p.carga.estado}`),
    `priv:${privadas}`,
  ].join(",");
  ssePush(userId, { count, privCount: privadas, hash });
}

export async function notifyEmpresa(userId: string) {
  const [enConfirmacion, postulacionesNuevas] = await Promise.all([
    db.carga.count({ where: { empresaId: userId, estado: "EN_CONFIRMACION" } }),
    db.postulacion.count({
      where: { carga: { empresaId: userId }, estado: "PENDIENTE", vistaEmpresa: false },
    }),
  ]);
  ssePush(userId, { count: enConfirmacion + postulacionesNuevas });
}
