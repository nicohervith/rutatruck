"use client";

import dynamic from "next/dynamic";
import type { TransportistaDisp } from "./MapaTransportistas";

const MapaTransportistas = dynamic(() => import("./MapaTransportistas"), { ssr: false });

export default function MapaTransportistasWrapper({ initialData }: { initialData: TransportistaDisp[] }) {
  return <MapaTransportistas initialData={initialData} />;
}
