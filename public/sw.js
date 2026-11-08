
self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : {};

  event.waitUntil(
    self.registration.showNotification(
      data.title || "HERDAY 💗",
      {
        body: data.body || "A special day is coming!",
        icon: "/icon.png",
        data: { url: data.url || "/" }
      }
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(
      event.notification.data.url || "/"
    )
  );
});
