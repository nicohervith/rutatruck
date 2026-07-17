import { obtenerPago } from "@/lib/mercadopago";
import {
  findCargaPendientePago,
  activarCargaPagada,
  asignarCargaPorComision,
  activarCargaPagadaDesdeRedirect,
} from "@/lib/repositories/carga.repository";
import { emit } from "@/lib/events/bus";

export async function procesarPago(paymentId: string) {
  const pago = await obtenerPago(paymentId);

  if (pago.status !== "approved") return;

  const externalReference = pago.external_reference;
  if (!externalReference) return;

  const matchPublicar = externalReference.match(/^publicar_(\d+)$/);
  if (matchPublicar) {
    const cargaId = parseInt(matchPublicar[1]);
    const carga = await findCargaPendientePago(cargaId);
    if (carga) {
      await activarCargaPagada(cargaId, String(pago.id));
      emit("pago.aprobado.publicacion", {
        cargaId,
        titulo: carga.titulo,
        origen: carga.origen,
        destino: carga.destino,
        origenLat: carga.origenLat,
        origenLng: carga.origenLng,
        empresaId: carga.empresaId,
      });
    }
    return;
  }

  const matchComision = externalReference.match(/^comision_carga_(\d+)$/);
  if (matchComision) {
    const cargaId = parseInt(matchComision[1]);
    await asignarCargaPorComision(cargaId, String(pago.id));
  }
}

export async function confirmarPagoPublicacion(
  cargaId: number,
  paymentId: string | null,
): Promise<{ ok: boolean }> {
  let carga;
  try {
    carga = await activarCargaPagadaDesdeRedirect(cargaId, paymentId);
  } catch {
    return { ok: false };
  }

  emit("pago.aprobado.publicacion", {
    cargaId,
    titulo: carga.titulo,
    origen: carga.origen,
    destino: carga.destino,
    origenLat: carga.origenLat,
    origenLng: carga.origenLng,
    empresaId: carga.empresaId,
  });

  return { ok: true };
}

export async function confirmarPagoComision(
  cargaId: number,
  paymentId: string | null,
): Promise<{ ok: boolean }> {
  try {
    await asignarCargaPorComision(cargaId, paymentId);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
