import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function findCargaPendientePago(cargaId: number) {
  return db.carga.findUnique({
    where: { id: cargaId, estado: "PENDIENTE_PAGO" },
    select: {
      id: true,
      titulo: true,
      origen: true,
      destino: true,
      origenLat: true,
      origenLng: true,
      empresaId: true,
    },
  });
}

export async function activarCargaPagada(cargaId: number, mpPaymentId: string) {
  return db.carga.update({
    where: { id: cargaId },
    data: { estado: "ACTIVA", pagado: true, mpPaymentId },
  });
}

export async function asignarCargaPorComision(cargaId: number, mpPaymentId: string | null) {
  return db.$transaction([
    db.carga.updateMany({
      where: { id: cargaId, estado: "PENDIENTE_PAGO_TRANSPORTISTA" },
      data: {
        estado: "ASIGNADA",
        transportistaMpPaymentId: mpPaymentId,
        transportistaPagoDeadline: null,
      },
    }),
    db.postulacion.updateMany({
      where: { cargaId, estado: "PENDIENTE" },
      data: { estado: "RECHAZADA" },
    }),
  ]);
}

export async function createCargaActiva(
  data: Omit<Prisma.CargaUncheckedCreateInput, "estado" | "pagado">,
) {
  return db.carga.create({ data: { ...data, estado: "ACTIVA", pagado: true } });
}

export async function createCargaPendientePago(
  data: Omit<Prisma.CargaUncheckedCreateInput, "estado">,
) {
  return db.carga.create({ data: { ...data, estado: "PENDIENTE_PAGO" } });
}

export async function deleteCarga(cargaId: number) {
  await db.carga.delete({ where: { id: cargaId } }).catch(() => {});
}

export async function findCargaActivaDeEmpresa(cargaId: number, empresaId: string) {
  return db.carga.findUnique({
    where: { id: cargaId, empresaId, estado: "ACTIVA" },
  });
}

export async function asignarCargaConvocatoriaCubierta(
  cargaId: number,
  transportistaId: string,
  singleCamion: boolean,
) {
  await db.$transaction([
    db.carga.update({
      where: { id: cargaId },
      data: {
        estado: "ASIGNADA",
        ...(singleCamion ? { transportistaAsignadoId: transportistaId } : {}),
      },
    }),
    db.disponibilidadTransportista.updateMany({
      where: { transportistaId },
      data: { activo: false },
    }),
  ]);
}

export async function asignarPagoPendienteTransportista(
  cargaId: number,
  transportistaId: string,
  deadline: Date,
) {
  await db.carga.update({
    where: { id: cargaId },
    data: {
      estado: "PENDIENTE_PAGO_TRANSPORTISTA",
      transportistaAsignadoId: transportistaId,
      transportistaPagoDeadline: deadline,
    },
  });
}

export async function findOfertaPrivada(cargaId: number, transportistaId: string) {
  return db.carga.findUnique({
    where: {
      id: cargaId,
      esPrivada: true,
      transportistaDestinadoId: transportistaId,
      estado: "ACTIVA",
    },
  });
}

export async function rechazarOfertaPrivada(cargaId: number) {
  await db.carga.update({ where: { id: cargaId }, data: { estado: "CANCELADA" } });
}

export async function aceptarOfertaPrivada(cargaId: number, transportistaId: string) {
  await db.$transaction([
    db.postulacion.create({
      data: {
        cargaId,
        transportistaId,
        estado: "ACEPTADA",
        camionesCubiertos: 1,
      },
    }),
    db.carga.update({
      where: { id: cargaId },
      data: {
        estado: "ASIGNADA",
        transportistaAsignadoId: transportistaId,
      },
    }),
    db.disponibilidadTransportista.updateMany({
      where: { transportistaId },
      data: { activo: false },
    }),
  ]);
}

export async function findCargaAsignadaTransportista(cargaId: number, transportistaId: string) {
  return db.carga.findUnique({
    where: { id: cargaId, transportistaAsignadoId: transportistaId, estado: "ASIGNADA" },
  });
}

export async function marcarEnConfirmacion(cargaId: number) {
  await db.carga.update({ where: { id: cargaId }, data: { estado: "EN_CONFIRMACION" } });
}

export async function findCargaActivaConAceptadas(cargaId: number, empresaId: string) {
  return db.carga.findUnique({
    where: { id: cargaId, empresaId, estado: "ACTIVA" },
    include: {
      postulaciones: { where: { estado: "ACEPTADA" }, select: { transportistaId: true } },
    },
  });
}

export async function cerrarConvocatoria(cargaId: number, transportistaAsignadoId?: string) {
  await db.carga.update({
    where: { id: cargaId },
    data: {
      estado: "ASIGNADA",
      ...(transportistaAsignadoId ? { transportistaAsignadoId } : {}),
    },
  });
}

export async function activarCargaPagadaDesdeRedirect(cargaId: number, mpPaymentId: string | null) {
  return db.carga.update({
    where: { id: cargaId, estado: "PENDIENTE_PAGO" },
    data: { estado: "ACTIVA", pagado: true, mpPaymentId },
    select: {
      titulo: true,
      origen: true,
      destino: true,
      origenLat: true,
      origenLng: true,
      empresaId: true,
    },
  });
}

export async function createOfertaPrivada(data: Prisma.CargaUncheckedCreateInput) {
  return db.carga.create({ data });
}

export async function findCargaActivaParaPostular(cargaId: number) {
  return db.carga.findUnique({
    where: { id: cargaId, estado: "ACTIVA" },
    select: { id: true, titulo: true, empresaId: true, fechaCarga: true },
  });
}

export async function findCargasEnViajeDeTransportista(transportistaId: string) {
  return db.carga.findMany({
    where: {
      transportistaAsignadoId: transportistaId,
      estado: { in: ["ASIGNADA", "PENDIENTE_PAGO_TRANSPORTISTA"] },
    },
    select: { id: true, fechaCarga: true, fechaCupo: true, titulo: true },
  });
}

export async function findCargasVencidasSinCompletar(umbralReintento: Date) {
  const ahora = new Date();
  return db.carga.findMany({
    where: {
      estado: "ASIGNADA",
      transportistaAsignadoId: { not: null },
      OR: [
        { recordatorioCompletarEnviadoEn: null },
        { recordatorioCompletarEnviadoEn: { lt: umbralReintento } },
      ],
      AND: [
        { OR: [{ fechaCupo: { lt: ahora } }, { fechaCupo: null, fechaCarga: { lt: ahora } }] },
      ],
    },
    select: { id: true, titulo: true, transportistaAsignadoId: true },
  });
}

export async function marcarRecordatorioCompletarEnviado(cargaIds: number[]) {
  await db.carga.updateMany({
    where: { id: { in: cargaIds } },
    data: { recordatorioCompletarEnviadoEn: new Date() },
  });
}

export async function findCargasAsignadasVencidasDeTransportista(transportistaId: string) {
  const ahora = new Date();
  return db.carga.findMany({
    where: {
      transportistaAsignadoId: transportistaId,
      estado: "ASIGNADA",
      OR: [{ fechaCupo: { lt: ahora } }, { fechaCupo: null, fechaCarga: { lt: ahora } }],
    },
    select: { id: true, titulo: true, origen: true, destino: true },
    orderBy: { fechaCarga: "asc" },
  });
}
