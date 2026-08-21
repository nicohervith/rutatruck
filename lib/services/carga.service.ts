import type { Prisma } from "@prisma/client";
import { crearPreferencia } from "@/lib/mercadopago";
import { getPrecioPublicacion } from "@/lib/comision";
import {
  createCargaActiva,
  createCargaPendientePago,
  deleteCarga,
  findOfertaPrivada,
  rechazarOfertaPrivada,
  aceptarOfertaPrivada,
  findCargaAsignadaTransportista,
  marcarEnConfirmacion,
  findCargaActivaConAceptadas,
  cerrarConvocatoria as cerrarConvocatoriaDb,
  createOfertaPrivada,
  findCargasVencidasSinCompletar,
  marcarRecordatorioCompletarEnviado,
  findCargasProximasSinAceptar,
  marcarRecordatorioSinPostulantesEnviado,
  findCargasVencidasParaCancelar,
  findCargasCanceladasParaPurgar,
  eliminarCargas,
} from "@/lib/repositories/carga.repository";
import { findUserById, findUserContacto, linkPhoneSiFalta } from "@/lib/repositories/user.repository";
import { emit } from "@/lib/events/bus";
import { sendPushToUser } from "@/lib/push";

type CargaData = Omit<Prisma.CargaUncheckedCreateInput, "estado" | "pagado"> & {
  titulo: string;
  origen: string;
  destino: string;
  origenLat: number | null;
  origenLng: number | null;
  empresaId: string;
};

export type PublicarCargaFreeTierResult =
  | { ok: true; cargaId: number }
  | { ok: false; status: number; error: string };

export async function publicarCargaFreeTier(
  cargaData: CargaData,
): Promise<PublicarCargaFreeTierResult> {
  let carga;
  try {
    carga = await createCargaActiva(cargaData);
  } catch (err) {
    console.error("[carga.service] Error Prisma:", err);
    return { ok: false, status: 500, error: "Error al guardar la carga" };
  }

  await linkPhoneSiFalta(cargaData.empresaId, cargaData.contactoTelefono).catch(() => {});

  emit("carga.publicada", {
    cargaId: carga.id,
    titulo: cargaData.titulo,
    origen: cargaData.origen,
    destino: cargaData.destino,
    origenLat: cargaData.origenLat,
    origenLng: cargaData.origenLng,
    empresaId: cargaData.empresaId,
  });

  return { ok: true, cargaId: carga.id };
}

export type PublicarCargaConPagoResult =
  | { ok: true; url: string }
  | { ok: false; status: number; error: string };

export async function publicarCargaConPago(
  cargaData: CargaData,
  origin: string,
): Promise<PublicarCargaConPagoResult> {
  let carga;
  try {
    carga = await createCargaPendientePago(cargaData);
  } catch (err) {
    console.error("[carga.service] Error Prisma:", err);
    return { ok: false, status: 500, error: "Error al guardar la carga" };
  }

  await linkPhoneSiFalta(cargaData.empresaId, cargaData.contactoTelefono).catch(() => {});

  const fee = await getPrecioPublicacion();

  let preference;
  try {
    preference = await crearPreferencia({
      items: [
        {
          id: carga.id.toString(),
          title: `Publicación de carga: ${carga.titulo}`,
          quantity: 1,
          unit_price: fee,
          currency_id: "ARS",
        },
      ],
      external_reference: `publicar_${carga.id}`,
      back_urls: {
        success: `${origin}/api/pagos/success`,
        failure: `${origin}/api/pagos/failure`,
        pending: `${origin}/api/pagos/failure`,
      },
      auto_return: "approved",
      statement_descriptor: "ClickCargo",
    });
  } catch (err) {
    console.error("[carga.service] Error MercadoPago:", err);
    await deleteCarga(carga.id);
    return { ok: false, status: 500, error: "Error al conectar con MercadoPago" };
  }

  const url =
    process.env.NODE_ENV === "production" ? preference.init_point : preference.sandbox_init_point;

  if (!url) {
    await deleteCarga(carga.id);
    return { ok: false, status: 500, error: "Error al crear preferencia de pago" };
  }

  return { ok: true, url };
}

export type ResponderOfertaPrivadaResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function responderOfertaPrivada(
  cargaId: number,
  transportistaId: string,
  accion: "aceptar" | "rechazar",
): Promise<ResponderOfertaPrivadaResult> {
  const carga = await findOfertaPrivada(cargaId, transportistaId);
  if (!carga) {
    return { ok: false, status: 404, error: "Oferta no encontrada" };
  }

  if (accion === "rechazar") {
    await rechazarOfertaPrivada(cargaId);
  } else {
    await aceptarOfertaPrivada(cargaId, transportistaId);
  }

  emit("oferta-privada.respondida", {
    empresaId: carga.empresaId,
    transportistaId,
    cargaId,
    titulo: carga.titulo,
    accion,
  });
  return { ok: true };
}

export type CompletarViajeResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function completarViaje(
  cargaId: number,
  transportistaId: string,
): Promise<CompletarViajeResult> {
  const carga = await findCargaAsignadaTransportista(cargaId, transportistaId);
  if (!carga) {
    return { ok: false, status: 404, error: "Carga no encontrada" };
  }

  await marcarEnConfirmacion(cargaId);

  emit("carga.completada", { empresaId: carga.empresaId, cargaId, titulo: carga.titulo });
  return { ok: true };
}

export type CerrarConvocatoriaResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

export async function cerrarConvocatoriaCarga(
  cargaId: number,
  empresaId: string,
): Promise<CerrarConvocatoriaResult> {
  const carga = await findCargaActivaConAceptadas(cargaId, empresaId);
  if (!carga) {
    return { ok: false, status: 404, error: "Carga no encontrada o no está activa" };
  }
  if (carga.postulaciones.length === 0) {
    return {
      ok: false,
      status: 400,
      error: "Debe aceptar al menos un transportista antes de cerrar",
    };
  }

  const transportistaIds = carga.postulaciones.map((p) => p.transportistaId);
  await cerrarConvocatoriaDb(cargaId, transportistaIds);

  emit("convocatoria.cerrada", {
    cargaId,
    titulo: carga.titulo,
    transportistaIds,
  });

  return { ok: true };
}

export type CrearOfertaPrivadaResult =
  | { ok: true; cargaId: number }
  | { ok: false; status: number; error: string };

export async function crearOfertaPrivada(
  empresaId: string,
  transportistaId: string,
  input: {
    titulo: string;
    origen: string;
    destino: string;
    tipoCarga: string;
    fechaCarga: Date;
    presupuesto: number | null;
    descripcion: string | null;
  },
): Promise<CrearOfertaPrivadaResult> {
  if (transportistaId === empresaId) {
    return { ok: false, status: 400, error: "No podés solicitarte a vos mismo" };
  }

  const [transportista, empresa] = await Promise.all([
    findUserById(transportistaId),
    findUserContacto(empresaId),
  ]);
  if (!transportista) {
    return { ok: false, status: 404, error: "Transportista no encontrado" };
  }

  const carga = await createOfertaPrivada({
    titulo: input.titulo,
    origen: input.origen,
    destino: input.destino,
    tipoCarga: input.tipoCarga,
    fechaCarga: input.fechaCarga,
    presupuesto: input.presupuesto,
    descripcion: input.descripcion,
    contactoNombre: empresa?.name ?? "Empresa",
    contactoTelefono: empresa?.phone ?? "",
    contactoEmail: empresa?.email ?? "",
    empresaId,
    estado: "ACTIVA",
    pagado: true,
    esPrivada: true,
    transportistaDestinadoId: transportistaId,
  });

  emit("oferta-privada.creada", { transportistaId, cargaId: carga.id, titulo: carga.titulo });

  return { ok: true, cargaId: carga.id };
}

export async function enviarRecordatoriosCompletar() {
  const umbral = new Date(Date.now() - 20 * 60 * 60 * 1000);
  const vencidas = await findCargasVencidasSinCompletar(umbral);
  if (vencidas.length === 0) return { ok: true, transportistas: 0, cargas: 0 };

  // Una carga puede estar cubierta por varios transportistas aceptados; hay que
  // avisarle a todos, no solo al que quedó en el escalar transportistaAsignadoId.
  const porTransportista = new Map<string, { id: number; titulo: string }[]>();
  for (const c of vencidas) {
    const destinatarios = new Set(c.postulaciones.map((p) => p.transportistaId));
    if (c.transportistaAsignadoId) destinatarios.add(c.transportistaAsignadoId);
    for (const transportistaId of destinatarios) {
      const list = porTransportista.get(transportistaId) ?? [];
      list.push({ id: c.id, titulo: c.titulo });
      porTransportista.set(transportistaId, list);
    }
  }

  await Promise.allSettled(
    Array.from(porTransportista.entries()).map(([transportistaId, cargas]) => {
      const payload =
        cargas.length === 1
          ? {
              title: "Marcá tu viaje como completado",
              body: `"${cargas[0].titulo}" ya pasó su fecha de cupo. Marcalo como completado para cerrar la operación.`,
              url: "/transportista/dashboard",
            }
          : {
              title: "Tenés viajes por marcar como completados",
              body: `${cargas.length} cargas ya pasaron su fecha de cupo. Revisalas y marcalas como completadas.`,
              url: "/transportista/dashboard",
            };
      return sendPushToUser(transportistaId, payload);
    }),
  );

  await marcarRecordatorioCompletarEnviado(vencidas.map((c) => c.id));
  return { ok: true, transportistas: porTransportista.size, cargas: vencidas.length };
}

/**
 * Avisa a la empresa cuando una carga ACTIVA está por vencer (o ya venció)
 * sin ningún transportista aceptado, para que edite la fecha o gestione la
 * convocatoria a tiempo. Se repite cada 24hs mientras el problema siga
 * sin resolverse (mismo patrón que enviarRecordatoriosCompletar).
 */
export async function enviarRecordatoriosSinPostulantes() {
  const limite = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const umbral = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const cargas = await findCargasProximasSinAceptar(limite, umbral);
  if (cargas.length === 0) return { ok: true, cargas: 0 };

  const ahora = new Date();

  await Promise.allSettled(
    cargas.map((c) => {
      const vencida = c.fechaCarga < ahora;
      return sendPushToUser(c.empresaId, {
        title: vencida ? "Carga sin transportista, fecha vencida" : "Tu carga está por vencer sin postulantes",
        body: vencida
          ? `"${c.titulo}" ya pasó su fecha de carga y no tenés ningún transportista aceptado. Editá la fecha o revisá las postulaciones.`
          : `"${c.titulo}" vence pronto y no tenés ningún transportista aceptado. Editá la fecha si hace falta.`,
        url: `/empresa/cargas/${c.id}`,
      });
    }),
  );

  await marcarRecordatorioSinPostulantesEnviado(cargas.map((c) => c.id));
  return { ok: true, cargas: cargas.length };
}

/**
 * Elimina automáticamente cargas ACTIVA cuya fecha de carga pasó hace más
 * de 2 días sin ningún transportista aceptado (sin postulantes o con todos
 * rechazados). La empresa ya fue avisada por enviarRecordatoriosSinPostulantes
 * desde que la fecha se acercaba. Borrar la carga limpia el listado y saca la
 * postulación pendiente de respuesta de la bandeja de los transportistas.
 */
export async function cancelarCargasVencidasSinAceptar() {
  const umbral = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const cargas = await findCargasVencidasParaCancelar(umbral);
  if (cargas.length === 0) return { ok: true, cargas: 0 };

  // Notificar antes de borrar: después del delete ya no existe el id.
  await Promise.allSettled(
    cargas.map((c) =>
      sendPushToUser(c.empresaId, {
        title: "Carga eliminada automáticamente",
        body: `"${c.titulo}" se eliminó porque pasaron más de 2 días de su fecha sin transportista aceptado.`,
        url: `/empresa/cargas`,
      }),
    ),
  );

  await eliminarCargas(cargas.map((c) => c.id));

  return { ok: true, cargas: cargas.length };
}

/**
 * Purga cargas CANCELADA con más de 2 días desde su última actualización
 * (que coincide con el momento de la cancelación). No tiene sentido guardar
 * las canceladas indefinidamente; se dejan un par de días de gracia por si
 * hay que consultarlas y luego se borran para limpiar el historial.
 */
export async function purgarCargasCanceladas() {
  const umbral = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const cargas = await findCargasCanceladasParaPurgar(umbral);
  if (cargas.length === 0) return { ok: true, cargas: 0 };

  await eliminarCargas(cargas.map((c) => c.id));

  return { ok: true, cargas: cargas.length };
}
