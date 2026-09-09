"use client";

import { useEffect } from "react";

// Complemento de PurgeAuthedCache para las notificaciones push. El navegador
// mantiene su subscripción y el server su fila de PushSubscription aunque la
// sesión termine, así que en un teléfono compartido los push del usuario
// anterior — con el preview de sus mensajes — le seguían llegando al siguiente
// hasta que alguien volviera a abrir la app logueado.
//
// Va en el login y el registro por lo mismo que PurgeAuthedCache: ahí
// convergen el logout explícito, los redirects por sesión vencida y el
// dispositivo prestado donde el usuario nuevo se crea una cuenta en vez de
// loguearse. proxy.ts saca de ambas rutas a cualquiera con sesión válida, así
// que llegar acá significa que en este dispositivo ya no hay sesión. Al volver
// a loguearse, PushNotificationSetup se resubscribe solo desde el layout.
//
// El unsubscribe() local va primero porque es el que corta la entrega: una vez
// dado de baja, el push service rechaza los envíos con 410 y lib/push.ts borra
// la fila igual. El POST solo la limpia en el acto para no dejarla muerta.
export default function PurgeAuthedPush() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        if (!sub) return;

        const { endpoint } = sub;
        await sub.unsubscribe().catch(() => {});

        fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
          keepalive: true,
        }).catch(() => {});
      })
      .catch(() => {});
  }, []);

  return null;
}
