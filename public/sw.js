self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title ?? "ClickCargo";
  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/badge-96.png",
    data: { url: data.url ?? "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl = event.notification.data?.url ?? "/";
  const url = rawUrl.startsWith("http") ? rawUrl : self.location.origin + rawUrl;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.startsWith(self.location.origin) && "focus" in c);
      if (existing) { existing.focus(); existing.navigate(url); return; }
      return clients.openWindow(url);
    })
  );
});
