
"use client";

import { useEffect } from "react";

export default function NotificationSetup() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .catch((error) => {
          console.error("Service worker error:", error);
        });
    }
  }, []);

  return null;
}
