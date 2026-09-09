-- La retención del chat de una carga FINALIZADA (24h) se medía contra
-- "updatedAt", que se mueve con cualquier escritura sobre la fila. Eso daba dos
-- errores opuestos: un update ajeno —marcar que se envió un recordatorio, por
-- ejemplo— le regalaba 24h más al hilo, y una conversación activa se cortaba
-- igual a mitad de charla, porque mandar mensajes no toca la carga.
--
-- "finalizadaEn" guarda el momento real de la transición a FINALIZADA y no lo
-- toca nada más.

ALTER TABLE "Carga" ADD COLUMN "finalizadaEn" TIMESTAMP(3);

-- Backfill: para las que ya están finalizadas, updatedAt es la mejor
-- aproximación disponible al momento en que se finalizaron.
UPDATE "Carga" SET "finalizadaEn" = "updatedAt" WHERE "estado" = 'FINALIZADA';
