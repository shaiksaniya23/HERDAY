"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SETTINGS_KEY = "herday-settings";
const PLANS_KEY = "herday-plans";

type Settings = {
  name: string;
  focusGoal: number;
  reminders: boolean;
  reminderSound: boolean;
  notifications: boolean;
};

const defaultSettings: Settings = {
  name: "My HERDAY",
  focusGoal: 6,
  reminders: true,
  reminderSound: true,
  notifications: false,
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<Settings>(defaultSettings);

  const [saved, setSaved] =
    useState(false);

  const [notificationMessage, setNotificationMessage] =
    useState("");

  const [showClearConfirm, setShowClearConfirm] =
    useState(false);

  /* =========================================
     LOAD SETTINGS
     ========================================= */

  useEffect(() => {
    const savedSettings =
      localStorage.getItem(
        SETTINGS_KEY
      );

    if (savedSettings) {
      try {
        const parsed =
          JSON.parse(savedSettings);

        setSettings({
          ...defaultSettings,
          ...parsed,
        });
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  /* =========================================
     SAVE SETTINGS
     ========================================= */

  const saveSettings = (
    updatedSettings: Settings
  ) => {
    setSettings(updatedSettings);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(updatedSettings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  /* =========================================
     UPDATE NAME
     ========================================= */

  const updateName = (
    value: string
  ) => {
    saveSettings({
      ...settings,
      name: value,
    });
  };

  /* =========================================
     FOCUS GOAL
     ========================================= */

  const updateFocusGoal = (
    value: string
  ) => {
    const number =
      Number(value);

    if (
      number < 1 ||
      number > 24
    ) {
      return;
    }

    saveSettings({
      ...settings,
      focusGoal: number,
    });
  };

  /* =========================================
     TOGGLE SETTING
     ========================================= */

  const toggleSetting = (
    key:
      | "reminders"
      | "reminderSound"
      | "notifications"
  ) => {
    saveSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  /* =========================================
     BROWSER NOTIFICATIONS
     ========================================= */

  const enableNotifications =
    async () => {
      setNotificationMessage("");

      if (
        typeof window ===
        "undefined"
      ) {
        return;
      }

      if (
        !("Notification" in window)
      ) {
        setNotificationMessage(
          "Your browser does not support notifications."
        );
        return;
      }

      const permission =
        await Notification.requestPermission();

      if (
        permission === "granted"
      ) {
        saveSettings({
          ...settings,
          notifications: true,
        });

        setNotificationMessage(
          "Notifications are enabled ♡"
        );

        new Notification(
          "HERDAY ♡",
          {
            body:
              "Your HERDAY reminders are ready.",
          }
        );
      } else {
        setNotificationMessage(
          "Notifications were not enabled."
        );

        saveSettings({
          ...settings,
          notifications: false,
        });
      }
    };

  /* =========================================
     CLEAR ALL DATA
     ========================================= */

  const clearAllData = () => {
    localStorage.removeItem(
      PLANS_KEY
    );

    localStorage.removeItem(
      SETTINGS_KEY
    );

    setSettings(
      defaultSettings
    );

    setShowClearConfirm(false);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  return (
    <main className="dashboard-page">

      {/* =====================================
          SIDEBAR
          ===================================== */}

      <aside className="dashboard-sidebar">

        <Link
          href="/dashboard"
          className="sidebar-logo"
        >
          <div className="sidebar-symbol">
            ✦
          </div>

          <div>
            <div className="sidebar-brand">
              HERDAY
            </div>

            <div className="sidebar-tagline">
              Plan your next step.
            </div>
          </div>
        </Link>

        <nav className="dashboard-nav">

          <Link
            href="/dashboard"
            className="nav-item"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            href="/dashboard"
            className="nav-item"
          >
            <span>＋</span>
            Add Plan
          </Link>

          <Link
            href="/applications"
            className="nav-item"
          >
            <span>▣</span>
            Applications
          </Link>

          <Link
            href="/deadlines"
            className="nav-item"
          >
            <span>◷</span>
            Deadlines
          </Link>

          <Link
            href="/tasks"
            className="nav-item"
          >
            <span>✓</span>
            Tasks
          </Link>

          <Link
            href="/settings"
            className="nav-item active"
          >
            <span>⚙</span>
            Settings
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="mini-profile">

            <div className="profile-circle">
              ♡
            </div>

            <div>
              <strong>
                My HERDAY
              </strong>

              <span>
                Your space
              </span>
            </div>

          </div>

        </div>

      </aside>

      {/* =====================================
          MAIN
          ===================================== */}

      <section className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="dashboard-eyebrow">
              MAKE HERDAY YOURS
            </p>

            <h1>
              Settings <span>♡</span>
            </h1>

            <p className="dashboard-subtitle">
              Personalize how HERDAY works for you.
            </p>

          </div>

          {saved && (
            <div className="settings-saved">
              Saved ♡
            </div>
          )}

        </header>

        {/* =====================================
            PROFILE
            ===================================== */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div>

              <p className="section-kicker">
                YOUR PROFILE
              </p>

              <h2>
                About you
              </h2>

            </div>

          </div>

          <div className="settings-card">

            <div className="settings-profile">

              <div className="settings-avatar">
                ♡
              </div>

              <div className="settings-profile-text">

                <strong>
                  {settings.name ||
                    "My HERDAY"}
                </strong>

                <span>
                  This is how HERDAY will
                  greet you.
                </span>

              </div>

            </div>

            <div className="settings-field">

              <label htmlFor="herday-name">
                Your name
              </label>

              <input
                id="herday-name"
                type="text"
                value={settings.name}
                onChange={(e) =>
                  updateName(
                    e.target.value
                  )
                }
                placeholder="Your name"
              />

            </div>

          </div>

        </section>

        {/* =====================================
            FOCUS
            ===================================== */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div>

              <p className="section-kicker">
                YOUR FOCUS
              </p>

              <h2>
                Daily focus goal
              </h2>

            </div>

          </div>

          <div className="settings-card">

            <div className="settings-row">

              <div className="settings-row-icon">
                ◔
              </div>

              <div className="settings-row-content">

                <strong>
                  Daily focus hours
                </strong>

                <span>
                  How much focused work do
                  you want to aim for each day?
                </span>

              </div>

              <div className="focus-goal-input">

                <input
                  type="number"
                  min="1"
                  max="24"
                  value={
                    settings.focusGoal
                  }
                  onChange={(e) =>
                    updateFocusGoal(
                      e.target.value
                    )
                  }
                />

                <span>
                  hours
                </span>

              </div>

            </div>

            <div className="settings-note">
              HERDAY currently uses this
              goal for your dashboard focus
              indicator.
            </div>

          </div>

        </section>

        {/* =====================================
            REMINDERS
            ===================================== */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div>

              <p className="section-kicker">
                STAY ON TRACK
              </p>

              <h2>
                Reminders
              </h2>

            </div>

          </div>

          <div className="settings-card">

            {/* REMINDERS */}

            <div className="settings-row">

              <div className="settings-row-icon">
                ◷
              </div>

              <div className="settings-row-content">

                <strong>
                  Deadline reminders
                </strong>

                <span>
                  Let HERDAY remind you before
                  important deadlines.
                </span>

              </div>

              <button
                className={`settings-toggle ${
                  settings.reminders
                    ? "on"
                    : ""
                }`}
                onClick={() =>
                  toggleSetting(
                    "reminders"
                  )
                }
                aria-label="Toggle reminders"
              >
                <span />
              </button>

            </div>

            <div className="settings-divider" />

            {/* SOUND */}

            <div className="settings-row">

              <div className="settings-row-icon">
                ♪
              </div>

              <div className="settings-row-content">

                <strong>
                  Reminder sound
                </strong>

                <span>
                  Play a sound when HERDAY
                  sends an in-app reminder.
                </span>

              </div>

              <button
                className={`settings-toggle ${
                  settings.reminderSound
                    ? "on"
                    : ""
                }`}
                onClick={() =>
                  toggleSetting(
                    "reminderSound"
                  )
                }
                aria-label="Toggle reminder sound"
              >
                <span />
              </button>

            </div>

            <div className="settings-divider" />

            {/* NOTIFICATIONS */}

            <div className="settings-row">

              <div className="settings-row-icon">
                ♢
              </div>

              <div className="settings-row-content">

                <strong>
                  Browser notifications
                </strong>

                <span>
                  Allow HERDAY to send
                  deadline notifications.
                </span>

                {notificationMessage && (
                  <small>
                    {notificationMessage}
                  </small>
                )}

              </div>

              <button
                className={`settings-toggle ${
                  settings.notifications
                    ? "on"
                    : ""
                }`}
                onClick={
                  enableNotifications
                }
                aria-label="Enable notifications"
              >
                <span />
              </button>

            </div>

          </div>

        </section>

        {/* =====================================
            DATA
            ===================================== */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <div>

              <p className="section-kicker">
                YOUR DATA
              </p>

              <h2>
                Manage HERDAY
              </h2>

            </div>

          </div>

          <div className="settings-card">

            <div className="settings-row">

              <div className="settings-row-icon">
                ♡
              </div>

              <div className="settings-row-content">

                <strong>
                  Your HERDAY data
                </strong>

                <span>
                  Your plans and settings are
                  currently stored in this browser.
                </span>

              </div>

            </div>

            <div className="settings-divider" />

            <div className="settings-danger-row">

              <div>

                <strong>
                  Clear all data
                </strong>

                <span>
                  Delete all plans, tasks and
                  saved settings from this browser.
                </span>

              </div>

              <button
                className="clear-data-button"
                onClick={() =>
                  setShowClearConfirm(
                    true
                  )
                }
              >
                CLEAR DATA
              </button>

            </div>

          </div>

        </section>

        {/* =====================================
            ABOUT
            ===================================== */}

        <section className="settings-about">

          <div className="settings-about-symbol">
            ✦
          </div>

          <h2>
            HERDAY
          </h2>

          <p>
            Your opportunities.
            <br />
            Your next step.
          </p>

          <span>
            Made for your future ♡
          </span>

        </section>

      </section>

      {/* =====================================
          CLEAR DATA CONFIRMATION
          ===================================== */}

      {showClearConfirm && (

        <div
          className="settings-overlay"
          onClick={() =>
            setShowClearConfirm(
              false
            )
          }
        >

          <div
            className="settings-confirm-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="confirm-symbol">
              !
            </div>

            <h2>
              Clear everything?
            </h2>

            <p>
              This will permanently remove
              your plans, tasks and HERDAY
              settings from this browser.
            </p>

            <div className="confirm-actions">

              <button
                className="cancel-clear-button"
                onClick={() =>
                  setShowClearConfirm(
                    false
                  )
                }
              >
                CANCEL
              </button>

              <button
                className="confirm-clear-button"
                onClick={
                  clearAllData
                }
              >
                YES, CLEAR DATA
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}