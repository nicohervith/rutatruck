import { on } from "@/lib/events/bus";
import { sendPushToTransportistasCercanos, sendPushToUser } from "@/lib/push";
import { notifyEmpresa, notifyTransportista } from "@/lib/sse";

function notificarCargaDisponibleCercana({
  titulo,
  origen,
  destino,
  origenLat,
  origenLng,
  empresaId,
}: {
  titulo: string;
  origen: string;
  destino: string;
  origenLat: number | null;
  origenLng: number | null;
  empresaId: string;
}) {
  void sendPushToTransportistasCercanos(
    {
      title: "Nueva carga disponible",
      body: `${titulo} · ${origen} → ${destino}`,
      url: "/transportista/cargas",
    },
    origenLat,
    origenLng,
    empresaId,
  );
}

on("pago.aprobado.publicacion", notificarCargaDisponibleCercana);
on("carga.publicada", notificarCargaDisponibleCercana);

on("postulacion.aceptada", ({ transportistaId, cargaId, titulo, convocatoriaCubierta, deadlineHoras }) => {
  const body =
    deadlineHoras !== undefined
      ? `Tenés ${deadlineHoras} horas para pagar la comisión y confirmar el viaje "${titulo}".`
      : convocatoriaCubierta
        ? `Sos el transportista asignado para "${titulo}". Contactate con la empresa para coordinar.`
        : `Fuiste aceptado para "${titulo}". La empresa está coordinando los transportistas restantes.`;

  sendPushToUser(transportistaId, {
    title: "¡Fuiste seleccionado!",
    body,
    url: `/transportista/cargas/${cargaId}`,
  }).catch(() => {});
  notifyTransportista(transportistaId).catch(() => {});
});

on("oferta-privada.respondida", ({ empresaId, transportistaId }) => {
  notifyEmpresa(empresaId).catch(() => {});
  notifyTransportista(transportistaId).catch(() => {});
});

on("carga.completada", ({ empresaId, cargaId, titulo }) => {
  sendPushToUser(empresaId, {
    title: "Viaje marcado como completado",
    body: `El transportista marcó "${titulo}" como completado. Confirmá o abrí una disputa.`,
    url: `/empresa/cargas/${cargaId}`,
  }).catch(() => {});
});

on("convocatoria.cerrada", ({ cargaId, titulo, transportistaIds }) => {
  for (const transportistaId of transportistaIds) {
    sendPushToUser(transportistaId, {
      title: "¡Convocatoria cerrada!",
      body: `Fuiste asignado para "${titulo}". Contactate con la empresa para coordinar.`,
      url: `/transportista/cargas/${cargaId}`,
    }).catch(() => {});
  }
});

on("postulacion.creada", ({ cargaId, empresaId, titulo }) => {
  sendPushToUser(empresaId, {
    title: "Nueva postulación",
    body: `Un transportista se postuló a "${titulo}"`,
    url: `/empresa/cargas/${cargaId}`,
  }).catch(() => {});
  notifyEmpresa(empresaId).catch(() => {});
});

on("postulacion.vista_transportista", ({ transportistaId }) => {
  notifyTransportista(transportistaId).catch(() => {});
});

on("postulacion.vista_empresa", ({ empresaId }) => {
  notifyEmpresa(empresaId).catch(() => {});
});

on("oferta-privada.creada", ({ transportistaId, cargaId, titulo }) => {
  sendPushToUser(transportistaId, {
    title: "Nueva oferta directa",
    body: `Una empresa te ofrece un servicio: ${titulo}`,
    url: `/transportista/cargas/${cargaId}`,
  }).catch(() => {});
  notifyTransportista(transportistaId).catch(() => {});
});
