/**
 * Plazos de los cierres automáticos, en días. Viven acá y no en
 * carga.service.ts para que un Server Component o un listener puedan leerlos
 * sin arrastrar todo el service (Mercado Pago incluido) en la cadena de
 * imports, y para que el texto que ve el usuario y el filtro del cron no se
 * puedan desincronizar.
 */

/** Días que una CANCELADA sigue visible y reactivable antes de que se borre. */
export const DIAS_GRACIA_CANCELADA = 2;

/**
 * Días que una ASIGNADA sobrevive después de la fecha del viaje antes de que
 * se la dé por realizada. El transportista recibe un recordatorio diario
 * (enviarRecordatoriosCompletar) durante toda esa ventana.
 */
export const DIAS_ASIGNADA_ABANDONADA = 7;

/**
 * Días que la empresa tiene para confirmar o abrir disputa sobre un viaje ya
 * marcado como completado, antes del cierre automático.
 */
export const DIAS_EN_CONFIRMACION_ABANDONADA = 7;
