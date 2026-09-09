import {
  crearMensaje,
  findPostulacionParaChat,
  contarMensajesRecientesDeAutor,
} from "@/lib/repositories/mensaje.repository";
import { emit } from "@/lib/events/bus";

/** Techo de envío: 10 mensajes cada 10 segundos por autor, sumando todos sus hilos. */
const MAX_MENSAJES_POR_VENTANA = 10;
const VENTANA_ENVIO_MS = 10_000;

export type EnviarMensajeResult =
  | { ok: true; mensaje: Awaited<ReturnType<typeof crearMensaje>> }
  | { ok: false; status: number; error: string };

export async function enviarMensaje(
  postulacionId: number,
  autorId: string,
  cuerpoCrudo: string,
): Promise<EnviarMensajeResult> {
  const cuerpo = cuerpoCrudo.trim();
  if (!cuerpo) {
    return { ok: false, status: 400, error: "El mensaje no puede estar vacío" };
  }
  if (cuerpo.length > 2000) {
    return { ok: false, status: 400, error: "Mensaje demasiado largo" };
  }

  // Cada mensaje dispara un push al otro extremo, así que sin techo un cliente
  // en loop se convierte en un generador de notificaciones. Se chequea antes de
  // resolver permisos para que el intento cueste un count y no un join.
  const recientes = await contarMensajesRecientesDeAutor(
    autorId,
    new Date(Date.now() - VENTANA_ENVIO_MS),
  );
  if (recientes >= MAX_MENSAJES_POR_VENTANA) {
    return {
      ok: false,
      status: 429,
      error: "Estás enviando mensajes demasiado rápido. Esperá unos segundos.",
    };
  }

  const postulacion = await findPostulacionParaChat(postulacionId, autorId);
  if (!postulacion) {
    return { ok: false, status: 404, error: "Conversación no encontrada" };
  }

  const mensaje = await crearMensaje(postulacionId, autorId, cuerpo);

  // Un hilo es una postulación, así que siempre son exactamente dos partes: el
  // destinatario es el otro extremo, sin listas ni broadcast.
  const esEmpresa = postulacion.carga.empresaId === autorId;
  const destinatarioId = esEmpresa ? postulacion.transportistaId : postulacion.carga.empresaId;
  const autorNombre = esEmpresa ? postulacion.carga.empresa.name : postulacion.transportista.name;

  emit("mensaje.creado", {
    postulacionId,
    autorId,
    destinatarioId,
    destinatarioRole: esEmpresa ? "transportista" : "empresa",
    autorNombre,
    cuerpo,
    titulo: postulacion.carga.titulo,
  });

  return { ok: true, mensaje };
}
