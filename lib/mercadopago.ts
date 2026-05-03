import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import type { PreferenceRequest } from "mercadopago/dist/clients/preference/commonTypes";

function getClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
}

export async function crearPreferencia(body: PreferenceRequest) {
  const preference = new Preference(getClient());
  return preference.create({ body });
}

export async function obtenerPago(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}
