"use client";

import { useEffect } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array(
    [...rawData].map((c) => c.charCodeAt(0)),
  ) as Uint8Array<ArrayBuffer>;
}

export default function PushNotificationSetup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    async function setup() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        if (Notification.permission === "denied") return;
        if (Notification.permission === "default") {
          const result = await Notification.requestPermission();
          if (result !== "granted") return;
        }

        const currentKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          const existingKey = existing.options.applicationServerKey
            ? new Uint8Array(existing.options.applicationServerKey)
            : null;
          const sameKey =
            existingKey &&
            existingKey.length === currentKey.length &&
            existingKey.every((b, i) => b === currentKey[i]);

          if (sameKey) {
            await sendSubscription(existing);
            return;
          }

          await existing.unsubscribe();
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: currentKey,
        });
        await sendSubscription(subscription);
      } catch {
        // silently fail — push notifications are not critical
      }
    }

    async function sendSubscription(sub: PushSubscription) {
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        }),
      });
    }

    setup();
  }, []);

  return null;
}
