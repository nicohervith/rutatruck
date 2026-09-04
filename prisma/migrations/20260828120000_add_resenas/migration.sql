-- CreateEnum
CREATE TYPE "TipoResena" AS ENUM ('A_TRANSPORTISTA', 'A_EMPRESA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "ratingPromedio" DOUBLE PRECISION,
                   ADD COLUMN "ratingCantidad" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Resena" (
    "id" SERIAL NOT NULL,
    "cargaId" INTEGER NOT NULL,
    "autorId" TEXT NOT NULL,
    "destinatarioId" TEXT NOT NULL,
    "tipo" "TipoResena" NOT NULL,
    "comunicacion" INTEGER NOT NULL,
    "cumplioFecha" INTEGER,
    "integridadCarga" INTEGER,
    "pagoEnTiempo" INTEGER,
    "datosReales" INTEGER,
    "promedio" DOUBLE PRECISION NOT NULL,
    "comentario" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicadaEn" TIMESTAMP(3),

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resena_cargaId_autorId_destinatarioId_key" ON "Resena"("cargaId", "autorId", "destinatarioId");

-- CreateIndex
CREATE INDEX "Resena_destinatarioId_publicadaEn_idx" ON "Resena"("destinatarioId", "publicadaEn");

-- CreateIndex
CREATE INDEX "Resena_publicadaEn_creadaEn_idx" ON "Resena"("publicadaEn", "creadaEn");

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "Carga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
