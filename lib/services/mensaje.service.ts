import { crearMensaje, findCargaParaChat } from "@/lib/repositories/mensaje.repository";
import { emit } from "@/lib/events/bus";

export type EnviarMensajeResult =
  | { ok: true; mensaje: Awaited<ReturnType<typeof crearMensaje>> }
  | { ok: false; status: number; error: string };

export async function enviarMensaje(
  cargaId: number,
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

  const carga = await findCargaParaChat(cargaId, autorId);
  if (!carga) {
    return { ok: false, status: 404, error: "Conversación no encontrada" };
  }

  const mensaje = await crearMensaje(cargaId, autorId, cuerpo);

  const esEmpresa = carga.empresaId === autorId;
  // Si la convocatoria la cubren varios transportistas, el mensaje de la empresa
  // le llega a todos: transportistaAsignadoId solo guarda a uno.
  const destinatarioIds = esEmpresa
    ? Array.from(
        new Set([
          ...carga.postulaciones.map((p) => p.transportistaId),
          ...(carga.transportistaAsignadoId ? [carga.transportistaAsignadoId] : []),
        ]),
      )
    : [carga.empresaId];
  const autorNombre = esEmpresa ? carga.empresa.name : (carga.transportistaAsignado?.name ?? "Transportista");

  emit("mensaje.creado", {
    cargaId,
    autorId,
    destinatarioIds,
    destinatarioRole: esEmpresa ? "transportista" : "empresa",
    autorNombre,
    cuerpo,
    titulo: carga.titulo,
  });

  return { ok: true, mensaje };
}
