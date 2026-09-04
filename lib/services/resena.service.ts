import {
  findCargaFinalizadaConPartes,
  crearResena as crearResenaDb,
  findResenaReciproca,
  publicarResenas,
  findResenasVencidasSinPublicar,
  recalcularRatingUsuario,
} from "@/lib/repositories/resena.repository";
import {
  COMENTARIO_MAX,
  DIAS_REVELADO,
  criteriosDe,
  type CriterioKey,
  type TipoResena,
} from "@/lib/resenas";

export type CrearResenaInput = {
  cargaId: number;
  destinatarioId: string;
  puntajes: Partial<Record<CriterioKey, unknown>>;
  comentario?: string | null;
};

export type CrearResenaResult =
  | { ok: true; publicada: boolean }
  | { ok: false; status: number; error: string };

function esPuntajeValido(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isInteger(valor) && valor >= 1 && valor <= 5;
}

/**
 * Crea la reseña de un viaje finalizado. El rol de la reseña no sale de la
 * sesión sino de la carga: quien la publicó califica a los transportistas
 * aceptados y ellos califican a la empresa.
 *
 * La reseña nace oculta. Se publica —y recién ahí suma al promedio— cuando la
 * contraparte también califica, o cuando el cron la libera a los
 * DIAS_REVELADO días. Así ninguno de los dos puede calificar en represalia.
 */
export async function crearResenaViaje(
  autorId: string,
  input: CrearResenaInput,
): Promise<CrearResenaResult> {
  if (autorId === input.destinatarioId) {
    return { ok: false, status: 400, error: "No podés calificarte a vos mismo" };
  }

  const carga = await findCargaFinalizadaConPartes(input.cargaId);
  if (!carga) {
    return { ok: false, status: 404, error: "Carga no encontrada" };
  }
  if (carga.estado !== "FINALIZADA") {
    return {
      ok: false,
      status: 409,
      error: "Solo se puede calificar un viaje finalizado",
    };
  }

  const transportistas = carga.postulaciones.map((p) => p.transportistaId);

  let tipo: TipoResena;
  if (autorId === carga.empresaId && transportistas.includes(input.destinatarioId)) {
    tipo = "A_TRANSPORTISTA";
  } else if (transportistas.includes(autorId) && input.destinatarioId === carga.empresaId) {
    tipo = "A_EMPRESA";
  } else {
    return { ok: false, status: 403, error: "No participaste de este viaje" };
  }

  const criterios = criteriosDe(tipo);
  const puntajes: Record<string, number> = {};
  for (const criterio of criterios) {
    const valor = input.puntajes[criterio.key];
    if (!esPuntajeValido(valor)) {
      return {
        ok: false,
        status: 400,
        error: `Puntuá "${criterio.label}" de 1 a 5 estrellas`,
      };
    }
    puntajes[criterio.key] = valor;
  }

  const promedio =
    criterios.reduce((suma, c) => suma + puntajes[c.key], 0) / criterios.length;

  const comentario = input.comentario?.trim() || null;
  if (comentario && comentario.length > COMENTARIO_MAX) {
    return {
      ok: false,
      status: 400,
      error: `El comentario no puede superar los ${COMENTARIO_MAX} caracteres`,
    };
  }

  // La recíproca se busca antes de crear: si ya existe, las dos se publican
  // juntas en cuanto esta queda guardada.
  const reciproca = await findResenaReciproca(input.cargaId, autorId, input.destinatarioId);

  let resena;
  try {
    resena = await crearResenaDb({
      cargaId: input.cargaId,
      autorId,
      destinatarioId: input.destinatarioId,
      tipo,
      comunicacion: puntajes.comunicacion,
      cumplioFecha: puntajes.cumplioFecha ?? null,
      integridadCarga: puntajes.integridadCarga ?? null,
      pagoEnTiempo: puntajes.pagoEnTiempo ?? null,
      datosReales: puntajes.datosReales ?? null,
      promedio,
      comentario,
    });
  } catch {
    return { ok: false, status: 409, error: "Ya calificaste este viaje" };
  }

  if (!reciproca) {
    return { ok: true, publicada: false };
  }

  const ahora = new Date();
  const aPublicar = [resena.id, ...(reciproca.publicadaEn ? [] : [reciproca.id])];
  await publicarResenas(aPublicar, ahora);
  await Promise.all([
    recalcularRatingUsuario(input.destinatarioId),
    recalcularRatingUsuario(autorId),
  ]);

  return { ok: true, publicada: true };
}

/**
 * Libera las reseñas cuya ventana de doble ciego venció sin que la contraparte
 * calificara. Corre desde el cron diario.
 */
export async function publicarResenasVencidas() {
  const limite = new Date(Date.now() - DIAS_REVELADO * 24 * 60 * 60 * 1000);
  const vencidas = await findResenasVencidasSinPublicar(limite);
  if (vencidas.length === 0) return { publicadas: 0 };

  await publicarResenas(
    vencidas.map((r) => r.id),
    new Date(),
  );

  const destinatarios = [...new Set(vencidas.map((r) => r.destinatarioId))];
  for (const userId of destinatarios) {
    await recalcularRatingUsuario(userId);
  }

  return { publicadas: vencidas.length };
}
