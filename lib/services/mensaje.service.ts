import { crearMensaje, findPostulacionParaChat } from "@/lib/repositories/mensaje.repository";
import { emit } from "@/lib/events/bus";

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
