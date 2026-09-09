"use client";

import { useEffect, useRef } from "react";

/**
 * EventSource con dos cosas que los dos streams de la app necesitaban por
 * separado y ninguno tenía:
 *
 * 1. Reconexión con backoff exponencial y jitter, con tope de 30s. Antes los
 *    dos reintentaban a intervalo fijo (4s y 3s) sin tope: si /api/events se
 *    caía o devolvía 500, todos los clientes conectados lo martillaban a la vez.
 *
 * 2. Pausa cuando la pestaña deja de verse. Cada conexión abierta hace que el
 *    server consulte la base cada 10s (notificaciones) o cada 2.5s (chat), aun
 *    con el teléfono en el bolsillo. Al volver a primer plano reconecta, y como
 *    ambos streams mandan su estado al abrir —el chat con `after=<último id>`—
 *    no se pierde nada de lo que pasó mientras tanto.
 *
 * `buildUrl` se vuelve a evaluar en cada reconexión, que es lo que deja al chat
 * pedir solo los mensajes posteriores al último que ya tiene.
 */
export function useLiveStream(
  clave: string | number,
  buildUrl: () => string,
  wire: (es: EventSource) => void,
) {
  const buildUrlRef = useRef(buildUrl);
  const wireRef = useRef(wire);

  // Sin deps: corre después de cada render para que la reconexión siempre use
  // los callbacks actuales. Va declarado antes del efecto de la conexión para
  // que se ejecute primero cuando los dos corren en el mismo render.
  useEffect(() => {
    buildUrlRef.current = buildUrl;
    wireRef.current = wire;
  });

  useEffect(() => {
    let es: EventSource | null = null;
    let retryId: ReturnType<typeof setTimeout> | undefined;
    let intentos = 0;
    let desmontado = false;

    function abrir() {
      if (desmontado || document.hidden || es) return;

      const fuente = new EventSource(buildUrlRef.current());
      es = fuente;

      fuente.addEventListener("open", () => {
        intentos = 0;
      });

      wireRef.current(fuente);

      fuente.onerror = () => {
        fuente.close();
        if (es === fuente) es = null;
        if (desmontado || document.hidden) return;

        const base = Math.min(30_000, 1000 * 2 ** intentos);
        intentos++;
        retryId = setTimeout(abrir, base * (0.5 + Math.random()));
      };
    }

    function cerrar() {
      clearTimeout(retryId);
      retryId = undefined;
      es?.close();
      es = null;
    }

    function onVisibilidad() {
      if (document.hidden) {
        cerrar();
      } else {
        intentos = 0;
        abrir();
      }
    }

    abrir();
    document.addEventListener("visibilitychange", onVisibilidad);

    return () => {
      desmontado = true;
      document.removeEventListener("visibilitychange", onVisibilidad);
      cerrar();
    };
  }, [clave]);
}
