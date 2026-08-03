import { after } from "next/server";
import { on } from "@/lib/events/bus";
import { sendPushToTransportistasCercanos, sendPushToUser } from "@/lib/push";
import { notifyEmpresa, notifyTransportista } from "@/lib/sse";

/**
 * Los listeners disparan trabajo async (push + SSE) sin bloquear la respuesta
 * HTTP. En Vercel, la función serverless puede congelarse apenas se envía la
 * respuesta, matando esas promesas a mitad de camino si no van dentro de
 * `after()` — por eso todo el trabajo de cada listener se agrupa en un único
 * `after()` en vez de quedar "fire-and-forget" suelto.
 */

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
  after(() =>
    sendPushToTransportistasCercanos(
      {
        title: "Nueva carga disponible",
        body: `${titulo} · ${origen} → ${destino}`,
        url: "/transportista/cargas",
      },
      origenLat,
      origenLng,
      empresaId,
    ).catch(() => {}),
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

  after(async () => {
    await Promise.allSettled([
      sendPushToUser(transportistaId, {
        title: "¡Fuiste seleccionado!",
        body,
        url: `/transportista/cargas/${cargaId}`,
      }),
      notifyTransportista(transportistaId),
    ]);
  });
});

on("oferta-privada.respondida", ({ empresaId, transportistaId, cargaId, titulo, accion }) => {
  after(async () => {
    await Promise.allSettled([
      accion === "aceptar"
        ? sendPushToUser(empresaId, {
            title: "¡Oferta aceptada!",
            body: `El transportista aceptó tu oferta para "${titulo}".`,
            url: `/empresa/cargas/${cargaId}`,
          })
        : sendPushToUser(empresaId, {
            title: "Oferta rechazada",
            body: `El transportista rechazó tu oferta para "${titulo}".`,
            url: `/empresa/cargas/${cargaId}`,
          }),
      notifyEmpresa(empresaId),
      notifyTransportista(transportistaId),
    ]);
  });
});

on("carga.completada", ({ empresaId, cargaId, titulo }) => {
  after(() =>
    sendPushToUser(empresaId, {
      title: "Viaje marcado como completado",
      body: `El transportista marcó "${titulo}" como completado. Confirmá o abrí una disputa.`,
      url: `/empresa/cargas/${cargaId}`,
    }).catch(() => {}),
  );
});

on("convocatoria.cerrada", ({ cargaId, titulo, transportistaIds }) => {
  after(async () => {
    await Promise.allSettled(
      transportistaIds.map((transportistaId) =>
        sendPushToUser(transportistaId, {
          title: "¡Convocatoria cerrada!",
          body: `Fuiste asignado para "${titulo}". Contactate con la empresa para coordinar.`,
          url: `/transportista/cargas/${cargaId}`,
        }),
      ),
    );
  });
});

on("postulacion.creada", ({ cargaId, empresaId, titulo }) => {
  after(async () => {
    await Promise.allSettled([
      sendPushToUser(empresaId, {
        title: "Nueva postulación",
        body: `Un transportista se postuló a "${titulo}"`,
        url: `/empresa/cargas/${cargaId}`,
      }),
      notifyEmpresa(empresaId),
    ]);
  });
});

on("postulacion.vista_transportista", ({ transportistaId }) => {
  after(() => notifyTransportista(transportistaId).catch(() => {}));
});

on("postulacion.vista_empresa", ({ empresaId }) => {
  after(() => notifyEmpresa(empresaId).catch(() => {}));
});

on("oferta-privada.creada", ({ transportistaId, cargaId, titulo }) => {
  after(async () => {
    await Promise.allSettled([
      sendPushToUser(transportistaId, {
        title: "Nueva oferta directa",
        body: `Una empresa te ofrece un servicio: ${titulo}`,
        url: `/transportista/cargas/${cargaId}`,
      }),
      notifyTransportista(transportistaId),
    ]);
  });
});
