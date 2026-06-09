import webpush from "web-push";
import { db } from "./db";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function sendPushToAllTransportistas(
  payload: { title: string; body: string; url?: string },
  excludeUserId?: string
) {
  const subscriptions = await db.pushSubscription.findMany({
    where: {
      user: {
        role: { in: ["TRANSPORTISTA", "TRANSPORTISTA_FLOTA", "EMPRESA_TRANSPORTISTA"] },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    },
  });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
        }
      }
    })
  );
}

export async function sendPushToTransportistasCercanos(
  payload: { title: string; body: string; url?: string },
  origenLat: number | null,
  origenLng: number | null,
  excludeUserId?: string
) {
  const subscriptions = await db.pushSubscription.findMany({
    where: {
      user: {
        role: { in: ["TRANSPORTISTA", "TRANSPORTISTA_FLOTA", "EMPRESA_TRANSPORTISTA"] },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    },
    include: {
      user: { select: { notifZonaLat: true, notifZonaLng: true, notifRadioKm: true } },
    },
  });

  const filtered = subscriptions.filter((sub) => {
    const { notifZonaLat, notifZonaLng, notifRadioKm } = sub.user;
    if (notifRadioKm === null || notifZonaLat === null || notifZonaLng === null) return true;
    if (origenLat === null || origenLng === null) return true;
    return haversineKm(notifZonaLat, notifZonaLng, origenLat, origenLng) <= notifRadioKm;
  });

  await Promise.allSettled(
    filtered.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.pushSubscription.delete({ where: { endpoint: sub.endpoint } }).catch(() => {});
        }
      }
    })
  );
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        }
      }
    })
  );
}
