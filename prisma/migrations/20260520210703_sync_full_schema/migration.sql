/*
  Warnings:

  - You are about to drop the column `fechaEntrega` on the `Carga` table. All the data in the column will be lost.
  - You are about to drop the column `tiempoEstimado` on the `Carga` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoPostulacion" AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstadoCarga" ADD VALUE 'PENDIENTE_PAGO_TRANSPORTISTA';
ALTER TYPE "EstadoCarga" ADD VALUE 'EN_CONFIRMACION';
ALTER TYPE "EstadoCarga" ADD VALUE 'DISPUTA';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TRANSPORTISTA_FLOTA';

-- AlterTable
ALTER TABLE "Carga" DROP COLUMN "fechaEntrega",
DROP COLUMN "tiempoEstimado",
ADD COLUMN     "cantidadCamiones" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "destinoLat" DOUBLE PRECISION,
ADD COLUMN     "destinoLng" DOUBLE PRECISION,
ADD COLUMN     "disputaAbiertaPor" TEXT,
ADD COLUMN     "disputaDescripcion" TEXT,
ADD COLUMN     "fechaCupo" TIMESTAMP(3),
ADD COLUMN     "origenLat" DOUBLE PRECISION,
ADD COLUMN     "origenLng" DOUBLE PRECISION,
ADD COLUMN     "preferenciaCamion" TEXT,
ADD COLUMN     "tipoCargaDetalle" TEXT,
ADD COLUMN     "transportistaAsignadoId" TEXT,
ADD COLUMN     "transportistaMpPaymentId" TEXT,
ADD COLUMN     "transportistaPagoDeadline" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Postulacion" (
    "id" SERIAL NOT NULL,
    "cargaId" INTEGER NOT NULL,
    "transportistaId" TEXT NOT NULL,
    "mensaje" TEXT,
    "contactoEmail" TEXT,
    "contactoTelefono" TEXT,
    "estado" "EstadoPostulacion" NOT NULL DEFAULT 'PENDIENTE',
    "camionesCubiertos" INTEGER NOT NULL DEFAULT 1,
    "precioOfrecido" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vistaTransportista" BOOLEAN NOT NULL DEFAULT false,
    "vistaEmpresa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigApp" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "comisionTipo" TEXT NOT NULL DEFAULT 'FIJO',
    "comisionValor" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "precioPublicacion" DOUBLE PRECISION NOT NULL DEFAULT 500,

    CONSTRAINT "ConfigApp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Postulacion_cargaId_transportistaId_key" ON "Postulacion"("cargaId", "transportistaId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- AddForeignKey
ALTER TABLE "Carga" ADD CONSTRAINT "Carga_transportistaAsignadoId_fkey" FOREIGN KEY ("transportistaAsignadoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_cargaId_fkey" FOREIGN KEY ("cargaId") REFERENCES "Carga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_transportistaId_fkey" FOREIGN KEY ("transportistaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
