/**
 * Reglas de vigencia de la disponibilidad de un transportista.
 *
 * `activo` solo indica que el transportista no la desactivó manualmente.
 * Pero la disponibilidad también vence sola por tiempo: 24 h si marcó
 * "Disponible hoy", 7 días si no. El campo `activo` NUNCA se apaga solo
 * al vencer — por eso hay que chequear siempre `actualizadoEn` además
 * de `activo`, tanto para decidir si aparece en el mapa de empresas
 * como para lo que ve el propio transportista.
 */

export const DISPONIBLE_HOY_MS = 24 * 60 * 60 * 1000;
export const DISPONIBLE_SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

/** Cláusula Prisma para traer solo disponibilidades activas y vigentes (visibles en el mapa). */
export function whereDisponibilidadVigente() {
  const cutoff24h = new Date(Date.now() - DISPONIBLE_HOY_MS);
  const cutoff7d = new Date(Date.now() - DISPONIBLE_SEMANA_MS);
  return {
    activo: true as const,
    OR: [
      { disponibleHoy: true, actualizadoEn: { gte: cutoff24h } },
      { disponibleHoy: false, actualizadoEn: { gte: cutoff7d } },
    ],
  };
}

/** true si una disponibilidad ya cargada sigue vigente (no vencida por tiempo). */
export function esDisponibilidadVigente(disp: {
  disponibleHoy: boolean;
  actualizadoEn: Date | string;
}): boolean {
  const cutoffMs = disp.disponibleHoy ? DISPONIBLE_HOY_MS : DISPONIBLE_SEMANA_MS;
  const actualizadoEn = new Date(disp.actualizadoEn).getTime();
  return Date.now() - actualizadoEn < cutoffMs;
}
