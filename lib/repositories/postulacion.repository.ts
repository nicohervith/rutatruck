import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function findPostulacionPendiente(postulacionId: number, cargaId: number) {
  return db.postulacion.findUnique({
    where: { id: postulacionId, cargaId, estado: "PENDIENTE" },
  });
}

export async function aceptarPostulacion(postulacionId: number) {
  await db.postulacion.update({
    where: { id: postulacionId },
    data: { estado: "ACEPTADA" },
  });
}

export async function sumCamionesCubiertos(cargaId: number) {
  const aceptadas = await db.postulacion.findMany({
    where: { cargaId, estado: "ACEPTADA" },
    select: { camionesCubiertos: true },
  });
  return aceptadas.reduce((sum, p) => sum + p.camionesCubiertos, 0);
}

export async function countPostulacionesAceptadas(cargaId: number) {
  return db.postulacion.count({ where: { cargaId, estado: "ACEPTADA" } });
}

export async function crearPostulacion(data: Prisma.PostulacionUncheckedCreateInput) {
  return db.postulacion.create({ data });
}

export async function marcarVistasTransportista(transportistaId: string) {
  await db.postulacion.updateMany({
    where: { transportistaId, estado: "ACEPTADA", vistaTransportista: false },
    data: { vistaTransportista: true },
  });
}

export async function marcarVistasEmpresa(empresaId: string) {
  await db.postulacion.updateMany({
    where: { carga: { empresaId }, estado: "PENDIENTE", vistaEmpresa: false },
    data: { vistaEmpresa: true },
  });
}
