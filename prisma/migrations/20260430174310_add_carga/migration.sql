-- CreateEnum
CREATE TYPE "EstadoCarga" AS ENUM ('PENDIENTE_PAGO', 'ACTIVA', 'ASIGNADA', 'FINALIZADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Carga" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "tipoCarga" TEXT NOT NULL,
    "peso" DOUBLE PRECISION,
    "volumen" DOUBLE PRECISION,
    "presupuesto" DOUBLE PRECISION,
    "fechaCarga" TIMESTAMP(3) NOT NULL,
    "fechaEntrega" TIMESTAMP(3),
    "tiempoEstimado" TEXT,
    "descripcion" TEXT,
    "contactoNombre" TEXT NOT NULL,
    "contactoTelefono" TEXT NOT NULL,
    "contactoEmail" TEXT NOT NULL,
    "estado" "EstadoCarga" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "mpPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "Carga_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Carga" ADD CONSTRAINT "Carga_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
