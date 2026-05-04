
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import type { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes";

function getClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
}

export async function crearPreferencia(body: PreferenceRequest) {
  if (process.env.NODE_ENV !== "production" && !process.env.MP_ACCESS_TOKEN) {
    const externalRef = body.external_reference ?? "mock";
    return {
      id: "mock-preference-id",
      init_point: `${process.env.NEXTAUTH_URL}/empresa/pago-mock?ref=${externalRef}`,
      sandbox_init_point: `${process.env.NEXTAUTH_URL}/empresa/pago-mock?ref=${externalRef}`,
    };
  }

  const preference = new Preference(getClient());
  return preference.create({ body });
}

export async function obtenerPago(paymentId: string) {
  if (process.env.NODE_ENV !== "production" && !process.env.MP_ACCESS_TOKEN) {
    return {
      id: paymentId,
      status: "approved",
      external_reference: paymentId,
    };
  }

  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}
