export const isEmpresa = (role: string) =>
  role === "EMPRESA" || role === "EMPRESA_TRANSPORTISTA";

export const isTransportista = (role: string) =>
  role === "TRANSPORTISTA" ||
  role === "TRANSPORTISTA_FLOTA" ||
  role === "EMPRESA_TRANSPORTISTA";

export const isFlota = (role: string, esFlota: boolean) =>
  role === "TRANSPORTISTA_FLOTA" ||
  (role === "EMPRESA_TRANSPORTISTA" && esFlota);
