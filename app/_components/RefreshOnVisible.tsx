"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// El Router Cache de Next siempre sirve back/forward desde la copia cacheada,
// a propósito, para no perder el scroll ni causar layout shift — y eso no se
// puede desactivar por config (staleTimes no aplica a back/forward). Entonces
// al volver del chat al listado se veía el estado previo a la visita: último
// mensaje viejo, contador de no leídos desactualizado, o directamente faltaba
// una conversación recién creada.
//
// EventsProvider ya refresca cuando cambia el hash del stream SSE, pero eso no
// cubre este caso: el hash cambió mientras estabas adentro del chat, así que al
// volver no hay ningún cambio nuevo que dispare el refresh.
//
// ChatThread hace lo mismo para su propio payload; esto es el equivalente para
// las páginas de listado, que son Server Components sin estado cliente propio.
export default function RefreshOnVisible() {
  const router = useRouter();

  useEffect(() => {
    // Al montar: cubre la vuelta desde el chat con el payload ya cacheado.
    router.refresh();

    function refrescarSiVisible() {
      if (document.visibilityState === "visible") router.refresh();
    }

    // `pageshow` cubre la restauración desde el bfcache del navegador, donde
    // no llega a dispararse visibilitychange (típico en Safari iOS).
    document.addEventListener("visibilitychange", refrescarSiVisible);
    window.addEventListener("pageshow", refrescarSiVisible);
    return () => {
      document.removeEventListener("visibilitychange", refrescarSiVisible);
      window.removeEventListener("pageshow", refrescarSiVisible);
    };
  }, [router]);

  return null;
}
