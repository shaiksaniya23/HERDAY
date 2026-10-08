const CACHE_NAME = "herday-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* =========================================
   PUSH NOTIFICATION
   ========================================= */

self.addEventListener("push", (event) => {
  let data = {
    title: "HERDAY ♡",
    body: "You have something coming up.",
  };

  try {
    if (event.data) {
      data = {
        ...data,
        ...event.data.json(),
      };
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "HERDAY ♡",
      {
        body:
          data.body ||
          "You have something coming up.",
        icon: "/icon-512.png",
        badge: "/icon-512.png",
        tag: data.tag || "herday-notification",
        renotify: true,
        requireInteraction: false,
        data: {
          url: data.url || "/dashboard",
        },
      }
    )
  );
});

/* =========================================
   CLICK NOTIFICATION
   ========================================= */

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const targetUrl =
      event.notification?.data?.url ||
      "/dashboard";

    event.waitUntil(
      clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      }).then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(
            targetUrl
          );
        }
      })
    );
  }
);

/* =========================================
   NORMAL FETCH
   ========================================= */

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});