-- El hilo de chat pasa de estar identificado por Carga a estarlo por Postulacion.
--
-- Motivo: una convocatoria de varios camiones termina con varias postulaciones
-- ACEPTADA sobre la misma carga. Con "cargaId" como clave del hilo, todos esos
-- transportistas compartían la misma sala y leían lo que la empresa le escribía
-- a cada uno, precio incluido.
--
-- El backfill reparte los mensajes existentes:
--   * los escritos por un transportista van a su propia postulación (la unique
--     (cargaId, transportistaId) garantiza que no hay ambigüedad);
--   * los escritos por la empresa se COPIAN al hilo de cada transportista
--     aceptado, para que cada uno conserve exactamente la conversación que ya
--     venía viendo. En una carga de un solo camión —el caso normal— esto es una
--     reescritura 1 a 1 y no duplica nada;
--   * lo que quede sin postulación a la que pertenecer (cargas sin ningún
--     aceptado) se borra: esos hilos ya eran inaccesibles desde la app.

-- 1. Columna nueva, nullable durante el backfill.
ALTER TABLE "Mensaje" ADD COLUMN "postulacionId" INTEGER;

-- 2. Mensajes de transportistas: a su propia postulación.
UPDATE "Mensaje" m
SET "postulacionId" = p."id"
FROM "Postulacion" p
WHERE p."cargaId" = m."cargaId"
  AND p."transportistaId" = m."autorId";

-- 3. Mensajes de la empresa: una copia por cada transportista aceptado.
--    El SELECT trabaja sobre el snapshot previo al INSERT, así que las filas
--    nuevas no se vuelven a leer.
INSERT INTO "Mensaje" ("cargaId", "autorId", "cuerpo", "creadoEn", "leidoEn", "postulacionId")
SELECT m."cargaId", m."autorId", m."cuerpo", m."creadoEn", m."leidoEn", p."id"
FROM "Mensaje" m
JOIN "Postulacion" p
  ON p."cargaId" = m."cargaId"
 AND p."estado" = 'ACEPTADA'
WHERE m."postulacionId" IS NULL;

-- 4. Originales de la empresa (ya copiados) y huérfanos sin aceptados.
DELETE FROM "Mensaje" WHERE "postulacionId" IS NULL;

-- 5. Cerrar el modelo nuevo.
ALTER TABLE "Mensaje" ALTER COLUMN "postulacionId" SET NOT NULL;

DROP INDEX IF EXISTS "Mensaje_cargaId_creadoEn_idx";
ALTER TABLE "Mensaje" DROP CONSTRAINT IF EXISTS "Mensaje_cargaId_fkey";
ALTER TABLE "Mensaje" DROP COLUMN "cargaId";

-- ON DELETE CASCADE: borrar una postulación se lleva su hilo. Antes eliminarCargas()
-- tenía que acordarse de borrar los mensajes a mano antes que las postulaciones.
ALTER TABLE "Mensaje"
  ADD CONSTRAINT "Mensaje_postulacionId_fkey"
  FOREIGN KEY ("postulacionId") REFERENCES "Postulacion"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Mensaje_postulacionId_creadoEn_idx" ON "Mensaje"("postulacionId", "creadoEn");

-- countMensajesNoLeidos() corre en cada tick del SSE de notificaciones (cada 10s
-- por usuario conectado) filtrando por autorId + leidoEn, y no tenía índice.
CREATE INDEX "Mensaje_autorId_leidoEn_idx" ON "Mensaje"("autorId", "leidoEn");
