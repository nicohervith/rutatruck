import { MercadoPagoConfig, Preference } from "mercadopago";
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
