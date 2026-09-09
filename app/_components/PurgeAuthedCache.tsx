"use client";

import { useEffect } from "react";

// El service worker cachea el HTML de cada navegación, incluidas las páginas
// autenticadas, y Cache Storage es por origen — no por sesión. Sin esto, en un
// dispositivo compartido el próximo usuario podía ver páginas del anterior.
//
// Se dispara desde el login y el registro porque ahí convergen todas las
// salidas de sesión: el logout explícito de `app/actions/auth.ts`, los
// redirects por sesión vencida, y el dispositivo prestado donde el usuario
// nuevo se crea una cuenta en vez de loguearse. proxy.ts saca de ambas rutas a
// cualquiera con sesión válida, así que llegar acá significa que en este
// dispositivo ya no hay sesión.
//
// La purga la hace el propio service worker, para no duplicar acá el nombre
// del cache y que se desincronice al subir CACHE_VERSION.
export default function PurgeAuthedCache() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.active?.postMessage({ type: "PURGE_AUTHED_CACHE" }))
      .catch(() => {});
  }, []);

  return null;
}
