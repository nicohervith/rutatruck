-- Reconstruida a partir del estado real de la DB de prod (columnas/tabla
-- aplicadas por fuera del flujo de migraciones en algún momento, nunca
-- quedaron registradas). Ver conversación: fix de drift 2026-08-06.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "notifZonaLat" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "notifZonaLng" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN "notifRadioKm" INTEGER;
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Carga" ADD COLUMN "esPrivada" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Carga" ADD COLUMN "transportistaDestinadoId" TEXT;
ALTER TABLE "Carga" ADD COLUMN "recordatorioCompletarEnviadoEn" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" SERIAL NOT NULL,
    "cargaId" INTEGER NOT NULL,
    "autorId" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leidoEn" TIMESTAMP(3),

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mensaje_cargaId_creadoEn_idx" ON "Mensaje"("cargaId", "creadoEn");

-- AddForeignKey
ALTER TABLE "Carga" ADD CONSTRAINT "Carga_transportistaDestinadoId_fkey" FOREIGN KEY ("transportistaDestinadoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "Carga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
