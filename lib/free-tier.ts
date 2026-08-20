/**
 * Período de lanzamiento gratuito (60 días).
 *
 * `FREE_TIER=true` desactiva los cobros de MercadoPago (publicación y comisión).
 * `FREE_TIER_FIN` (opcional, fecha ISO — ej. "2026-10-18") habilita el contador
 * de días restantes en el cartel. Sin esa variable el cartel igual se muestra,
 * pero con el texto genérico "por tiempo limitado".
 */

export const FREE_TIER = process.env.FREE_TIER === "true";

export const FREE_TIER_DIAS = 60;

export function finFreeTier(): Date | null {
  const raw = process.env.FREE_TIER_FIN;
  if (!raw) return null;
  const fecha = new Date(raw);
  return isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * Días completos que faltan para que termine la promoción, o `null` si no hay
 * fecha de fin configurada. Nunca devuelve negativo: si ya venció, devuelve 0.
 */
export function diasRestantesFreeTier(ahora = new Date()): number | null {
  const fin = finFreeTier();
  if (!fin) return null;
  const ms = fin.getTime() - ahora.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}
