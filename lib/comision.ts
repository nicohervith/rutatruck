import { db } from "./db";

export async function getComisionConfig() {
  return db.configApp.upsert({
    where: { id: 1 },
    create: { id: 1, comisionTipo: "FIJO", comisionValor: 100, precioPublicacion: 500 },
    update: {},
  });
}

export async function getPrecioPublicacion(): Promise<number> {
  const config = await db.configApp.upsert({
    where: { id: 1 },
    create: { id: 1, comisionTipo: "FIJO", comisionValor: 100, precioPublicacion: 500 },
    update: {},
    select: { precioPublicacion: true },
  });
  return config.precioPublicacion;
}

export function calcularComision(
  config: { comisionTipo: string; comisionValor: number },
  presupuesto: number | null,
): number {
  if (config.comisionTipo === "PORCENTAJE" && presupuesto !== null) {
    return Math.round(presupuesto * config.comisionValor * 100) / 100;
  }
  return config.comisionValor;
}

export async function expirarSeleccion(cargaId: number) {
  await db.$transaction([
    db.carga.update({
      where: { id: cargaId },
      data: {
        estado: "ACTIVA",
        transportistaAsignadoId: null,
        transportistaPagoDeadline: null,
      },
    }),
    db.postulacion.updateMany({
      where: { cargaId, estado: "ACEPTADA" },
      data: { estado: "RECHAZADA" },
    }),
  ]);
}

export function DEADLINE_HORAS() {
  return 2;
}
