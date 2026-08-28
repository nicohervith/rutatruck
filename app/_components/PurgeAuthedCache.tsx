"use client";

import { useEffect } from "react";

// El service worker cachea el HTML de cada navegación, incluidas las páginas
// autenticadas, y Cache Storage es por origen — no por sesión. Sin esto, en un
// dispositivo compartido el próximo usuario podía ver páginas del anterior.
//
// Se dispara desde el login porque ahí convergen todas las salidas de sesión:
// el logout explícito de `app/actions/auth.ts` y también los redirects por
// sesión vencida. La purga la hace el propio service worker, para no duplicar
// acá el nombre del cache y que se desincronice al subir CACHE_VERSION.
export default function PurgeAuthedCache() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.active?.postMessage({ type: "PURGE_AUTHED_CACHE" }))
      .catch(() => {});
  }, []);

  return null;
}
