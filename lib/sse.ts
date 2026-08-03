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

async function perfilIncompleto(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true, emailVerified: true },
  });
  return !user || !user.phone || !user.emailVerified;
}

export async function notifyTransportista(userId: string) {
  const [count, postulaciones, privadas, incompleto] = await Promise.all([
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
  ]);
  const hash = [
    ...postulaciones.map((p) => `${p.id}:${p.estado}:${p.carga.estado}`),
    `priv:${privadas}`,
  ].join(",");
  ssePush(userId, { count, privCount: privadas, hash, perfilIncompleto: incompleto });
}

export async function notifyEmpresa(userId: string) {
  const [enConfirmacion, postulacionesNuevas, incompleto] = await Promise.all([
    db.carga.count({ where: { empresaId: userId, estado: "EN_CONFIRMACION" } }),
    db.postulacion.count({
      where: { carga: { empresaId: userId }, estado: "PENDIENTE", vistaEmpresa: false },
    }),
    perfilIncompleto(userId),
  ]);
  ssePush(userId, { count: enConfirmacion + postulacionesNuevas, perfilIncompleto: incompleto });
}
