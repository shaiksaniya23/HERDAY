"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(
  base64String: string
) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 = (
    base64String + padding
  )
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) =>
      char.charCodeAt(0)
    )
  );
}

export default function NotificationButton() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const [enabled, setEnabled] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    setPermission(
      Notification.permission
    );

    const checkSubscription =
      async () => {
        try {
          const registration =
            await navigator.serviceWorker.ready;

          const subscription =
            await registration.pushManager.getSubscription();

          if (subscription) {
            setEnabled(true);
          }
        } catch (error) {
          console.error(
            "HERDAY subscription check error:",
            error
          );
        }
      };

    checkSubscription();
  }, []);

  const enableNotifications =
    async () => {
      if (loading) return;

      setLoading(true);
      setMessage("");

      try {
        /* =========================================
           BASIC BROWSER CHECKS
           ========================================= */

        if (
          typeof window === "undefined" ||
          !("Notification" in window)
        ) {
          setMessage(
            "Notifications are not supported in this browser."
          );
          return;
        }

        if (
          !("serviceWorker" in navigator) ||
          !("PushManager" in window)
        ) {
          setMessage(
            "Push notifications are not supported here."
          );
          return;
        }

        if (!VAPID_PUBLIC_KEY) {
          console.error(
            "NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing."
          );

          setMessage(
            "Notification setup is missing the public key."
          );

          return;
        }

        /* =========================================
           GET SIGNED-IN USER
           ========================================= */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setMessage(
            "Please sign in again before enabling notifications."
          );

          return;
        }

        /* =========================================
           ASK BROWSER PERMISSION
           ========================================= */

        let currentPermission =
          Notification.permission;

        if (
          currentPermission === "default"
        ) {
          currentPermission =
            await Notification.requestPermission();

          setPermission(
            currentPermission
          );
        }

        if (
          currentPermission !== "granted"
        ) {
          setMessage(
            "Please allow notifications in your browser settings."
          );

          return;
        }

        /* =========================================
           SERVICE WORKER
           ========================================= */

        const registration =
          await navigator.serviceWorker.ready;

        /* =========================================
           GET OR CREATE PUSH SUBSCRIPTION
           ========================================= */

        let subscription =
          await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription =
            await registration.pushManager.subscribe(
              {
                userVisibleOnly: true,

                applicationServerKey:
                  urlBase64ToUint8Array(
                    VAPID_PUBLIC_KEY
                  ),
              }
            );
        }

        const subscriptionJson =
          subscription.toJSON();

        const endpoint =
          subscriptionJson.endpoint;

        const p256dh =
          subscriptionJson.keys?.p256dh;

        const auth =
          subscriptionJson.keys?.auth;

        if (
          !endpoint ||
          !p256dh ||
          !auth
        ) {
          throw new Error(
            "Could not read the push subscription keys."
          );
        }

        /* =========================================
           SAVE SUBSCRIPTION TO SUPABASE
           ========================================= */

        const {
          error: saveError,
        } = await supabase
          .from("push_subscriptions")
          .upsert(
            {
              user_id: user.id,
              endpoint,
              p256dh,
              auth,
            },
            {
              onConflict:
                "user_id,endpoint",
            }
          );

        if (saveError) {
          console.error(
            "HERDAY subscription database error:",
            saveError
          );

          setMessage(
            `Could not save notification subscription: ${saveError.message}`
          );

          return;
        }

        /* =========================================
           UPDATE UI
           ========================================= */

        setEnabled(true);
        setMessage(
          "Notifications enabled ♡"
        );

        /* =========================================
           SEND TEST PUSH
           ========================================= */

        const {
          data: pushResult,
          error: pushError,
        } = await supabase.functions.invoke(
          "send-push-notification",
          {
            body: {},
          }
        );

        if (pushError) {
          console.error(
            "HERDAY push notification error:",
            pushError
          );

          setMessage(
            "Notifications are enabled, but the test notification could not be sent."
          );

          return;
        }

        console.log(
          "HERDAY push result:",
          pushResult
        );

        if (
          pushResult?.sent > 0
        ) {
          setMessage(
            "Notifications enabled ♡"
          );
        } else {
          setMessage(
            "Notifications are enabled, but no test notification was sent."
          );
        }
      } catch (error) {
        console.error(
          "HERDAY notification subscription error:",
          error
        );

        setMessage(
          error instanceof Error
            ? error.message
            : "Could not enable notifications."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "6px",
      }}
    >
      <button
        type="button"
        onClick={
          enableNotifications
        }
        disabled={
          loading || enabled
        }
        className="notification-button"
        style={{
          cursor:
            loading || enabled
              ? "default"
              : "pointer",
          opacity:
            loading ? 0.7 : 1,
        }}
      >
        <span>🔔</span>

        {loading
          ? "Turning on..."
          : enabled
          ? "Notifications on"
          : "Enable HERDAY Notifications"}
      </button>

      {message && (
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#306D29",
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
}