"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PlanTask = {
  id?: string;
  title?: string;
  completed?: boolean;
};

type Plan = {
  id: string;
  type: string;
  name: string;
  organization: string;
  deadlineDate: string;
  deadlineTime: string;
  tasks: (string | PlanTask)[];
  hours: number;
  plannedDate: string;
  plannedTime: string;
  reminder: string;
};

const STORAGE_KEY = "herday-plans";

export default function DeadlinesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setPlans(JSON.parse(saved));
      } catch {
        setPlans([]);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getDeadlineDate = (plan: Plan) => {
    return new Date(
      `${plan.deadlineDate}T${plan.deadlineTime}`
    );
  };

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      return (
        getDeadlineDate(a).getTime() -
        getDeadlineDate(b).getTime()
      );
    });
  }, [plans]);

  const getTimeRemaining = (plan: Plan) => {
    const deadline = getDeadlineDate(plan);

    const difference =
      deadline.getTime() - now.getTime();

    if (difference <= 0) {
      return {
        text: "Deadline passed",
        urgent: true,
        passed: true,
      };
    }

    const totalMinutes = Math.floor(
      difference / (1000 * 60)
    );

    const days = Math.floor(
      totalMinutes / (60 * 24)
    );

    const hours = Math.floor(
      (totalMinutes % (60 * 24)) / 60
    );

    const minutes = totalMinutes % 60;

    if (days > 0) {
      return {
        text: `${days} ${
          days === 1 ? "day" : "days"
        } left`,
        urgent: days <= 2,
        passed: false,
      };
    }

    if (hours > 0) {
      return {
        text: `${hours} ${
          hours === 1 ? "hour" : "hours"
        } left`,
        urgent: true,
        passed: false,
      };
    }

    return {
      text: `${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } left`,
      urgent: true,
      passed: false,
    };
  };

  const formatDate = (date: string) => {
    const deadline = new Date(
      `${date}T00:00:00`
    );

    return deadline.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time
      .split(":")
      .map(Number);

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const upcomingCount = sortedPlans.filter(
    (plan) =>
      getDeadlineDate(plan).getTime() >
      now.getTime()
  ).length;

  const passedCount = sortedPlans.filter(
    (plan) =>
      getDeadlineDate(plan).getTime() <=
      now.getTime()
  ).length;

  return (
    <main className="dashboard-page">

      {/* SIDEBAR */}
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
            className="nav-item active"
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
            className="nav-item"
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
              <strong>My HERDAY</strong>
              <span>Your space</span>
            </div>

          </div>

        </div>

      </aside>

      {/* MAIN */}
      <section className="dashboard-main">

        <header className="dashboard-header">

          <div>

            <p className="dashboard-eyebrow">
              DON'T MISS A THING
            </p>

            <h1>
              Deadlines <span>♡</span>
            </h1>

            <p className="dashboard-subtitle">
              Keep every important date in sight.
            </p>

          </div>

          <Link
            href="/dashboard"
            className="header-add-button"
          >
            <span>＋</span>
            Add Plan
          </Link>

        </header>

        {/* STATS */}
        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-card-top">

              <span className="stat-label">
                UPCOMING
              </span>

              <span className="stat-icon">
                ◷
              </span>

            </div>

            <div className="stat-number">
              {upcomingCount}
            </div>

            <p className="stat-description">
              deadlines coming up
            </p>

          </div>

          <div className="stat-card">

            <div className="stat-card-top">

              <span className="stat-label">
                TRACKED
              </span>

              <span className="stat-icon">
                ✦
              </span>

            </div>

            <div className="stat-number">
              {plans.length}
            </div>

            <p className="stat-description">
              total deadlines
            </p>

          </div>

          <div className="stat-card">

            <div className="stat-card-top">

              <span className="stat-label">
                PASSED
              </span>

              <span className="stat-icon">
                ✓
              </span>

            </div>

            <div className="stat-number">
              {passedCount}
            </div>

            <p className="stat-description">
              deadlines already passed
            </p>

          </div>

        </section>

        {/* DEADLINES */}
        <section className="dashboard-section-card deadlines-page-card">

          <div className="section-heading">

            <div>

              <p className="section-kicker">
                YOUR CALENDAR
              </p>

              <h2>
                All deadlines
              </h2>

            </div>

            <span className="application-count">
              {plans.length} tracked
            </span>

          </div>

          {sortedPlans.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ◷
              </div>

              <h3>
                No deadlines yet
              </h3>

              <p>
                Add an application or opportunity
                and its deadline will appear here
                automatically.
              </p>

              <Link
                href="/dashboard"
                className="empty-button"
              >
                ＋ Add your first plan
              </Link>

            </div>

          ) : (

            <div className="deadlines-list">

              {sortedPlans.map((plan) => {

                const remaining =
                  getTimeRemaining(plan);

                return (

                  <article
                    className={`deadline-card ${
                      remaining.urgent
                        ? "deadline-urgent"
                        : ""
                    } ${
                      remaining.passed
                        ? "deadline-passed"
                        : ""
                    }`}
                    key={plan.id}
                  >

                    <div className="deadline-date-box">

                      <span>
                        {new Date(
                          `${plan.deadlineDate}T00:00:00`
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                          }
                        )}
                      </span>

                      <strong>
                        {new Date(
                          `${plan.deadlineDate}T00:00:00`
                        ).getDate()}
                      </strong>

                    </div>

                    <div className="deadline-main">

                      <div className="application-type">
                        {plan.type}
                      </div>

                      <h3>
                        {plan.name}
                      </h3>

                      <p>
                        {plan.organization}
                      </p>

                      <div className="deadline-info">

                        <span>
                          📅{" "}
                          {formatDate(
                            plan.deadlineDate
                          )}
                        </span>

                        <span>
                          ⏰{" "}
                          {formatTime(
                            plan.deadlineTime
                          )}
                        </span>

                      </div>

                    </div>

                    <div className="deadline-countdown">

                      <span>
                        {remaining.passed
                          ? "STATUS"
                          : "TIME LEFT"}
                      </span>

                      <strong>
                        {remaining.text}
                      </strong>

                    </div>

                  </article>

                );
              })}

            </div>

          )}

        </section>

      </section>

    </main>
  );
}