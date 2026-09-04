/**
 * Definición compartida (server + client) del sistema de reseñas bilaterales.
 * Cada lado califica tres criterios de 1 a 5 estrellas; el promedio de la
 * reseña es el promedio simple de esos tres puntajes.
 */

/** Días que una reseña queda oculta si la contraparte todavía no calificó. */
export const DIAS_REVELADO = 14;

export const COMENTARIO_MAX = 500;

export type TipoResena = "A_TRANSPORTISTA" | "A_EMPRESA";

export type CriterioKey =
  | "comunicacion"
  | "cumplioFecha"
  | "integridadCarga"
  | "pagoEnTiempo"
  | "datosReales";

export type Criterio = { key: CriterioKey; label: string; ayuda: string };

export const CRITERIOS_A_TRANSPORTISTA: Criterio[] = [
  {
    key: "comunicacion",
    label: "Comunicación",
    ayuda: "Respondió a tiempo y avisó cómo venía el viaje",
  },
  {
    key: "cumplioFecha",
    label: "Cumplió la fecha de entrega",
    ayuda: "Cargó y entregó dentro de los plazos acordados",
  },
  {
    key: "integridadCarga",
    label: "Carga completa y en buen estado",
    ayuda: "Llegó sin faltantes ni daños",
  },
];

export const CRITERIOS_A_EMPRESA: Criterio[] = [
  {
    key: "comunicacion",
    label: "Comunicación",
    ayuda: "Respondió a tiempo y dio los datos que hacían falta",
  },
  {
    key: "pagoEnTiempo",
    label: "Pagó en tiempo y forma",
    ayuda: "Cumplió con el monto y el plazo acordados",
  },
  {
    key: "datosReales",
    label: "La carga era como se publicó",
    ayuda: "Peso, tipo de carga y lugares coincidían con la publicación",
  },
];

export function criteriosDe(tipo: TipoResena): Criterio[] {
  return tipo === "A_TRANSPORTISTA" ? CRITERIOS_A_TRANSPORTISTA : CRITERIOS_A_EMPRESA;
}

/** 4.6 → "4,6". Devuelve null si el usuario todavía no tiene reseñas publicadas. */
export function formatPromedio(promedio: number | null | undefined): string | null {
  if (promedio == null) return null;
  return promedio.toFixed(1).replace(".", ",");
}
