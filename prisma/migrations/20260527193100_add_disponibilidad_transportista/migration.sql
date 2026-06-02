-- CreateTable
CREATE TABLE "DisponibilidadTransportista" (
    "id" SERIAL NOT NULL,
    "transportistaId" TEXT NOT NULL,
    "vehiculo" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "radioKm" INTEGER,
    "regresoVacio" BOOLEAN NOT NULL DEFAULT false,
    "buscaCarga" BOOLEAN NOT NULL DEFAULT false,
    "voyAPuerto" BOOLEAN NOT NULL DEFAULT false,
    "disponibleHoy" BOOLEAN NOT NULL DEFAULT false,
    "salidaDesde" TEXT,
    "salidaDestino" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisponibilidadTransportista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoritoTransportista" (
    "id" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "transportistaId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoritoTransportista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DisponibilidadTransportista_transportistaId_key" ON "DisponibilidadTransportista"("transportistaId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoritoTransportista_empresaId_transportistaId_key" ON "FavoritoTransportista"("empresaId", "transportistaId");

-- AddForeignKey
ALTER TABLE "DisponibilidadTransportista" ADD CONSTRAINT "DisponibilidadTransportista_transportistaId_fkey" FOREIGN KEY ("transportistaId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoTransportista" ADD CONSTRAINT "FavoritoTransportista_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoTransportista" ADD CONSTRAINT "FavoritoTransportista_transportistaId_fkey" FOREIGN KEY ("transportistaId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
