export type Events = {
  "pago.aprobado.publicacion": {
    cargaId: number;
    titulo: string;
    origen: string;
    destino: string;
    origenLat: number | null;
    origenLng: number | null;
    empresaId: string;
  };
  "carga.publicada": {
    cargaId: number;
    titulo: string;
    origen: string;
    destino: string;
    origenLat: number | null;
    origenLng: number | null;
    empresaId: string;
  };
  "postulacion.aceptada": {
    transportistaId: string;
    cargaId: number;
    titulo: string;
    convocatoriaCubierta?: boolean;
    deadlineHoras?: number;
  };
  "oferta-privada.respondida": {
    empresaId: string;
    transportistaId: string;
    cargaId: number;
    titulo: string;
    accion: "aceptar" | "rechazar";
  };
  "carga.completada": {
    empresaId: string;
    cargaId: number;
    titulo: string;
  };
  "convocatoria.cerrada": {
    cargaId: number;
    titulo: string;
    transportistaIds: string[];
  };
  "postulacion.creada": {
    cargaId: number;
    empresaId: string;
    titulo: string;
  };
  "postulacion.vista_transportista": {
    transportistaId: string;
  };
  "postulacion.vista_empresa": {
    empresaId: string;
  };
  "oferta-privada.creada": {
    transportistaId: string;
    cargaId: number;
    titulo: string;
  };
  "mensaje.creado": {
    cargaId: number;
    autorId: string;
    /** Varios cuando la empresa le escribe a una carga cubierta por más de un transportista. */
    destinatarioIds: string[];
    destinatarioRole: "empresa" | "transportista";
    autorNombre: string;
    cuerpo: string;
    titulo: string;
  };
};
