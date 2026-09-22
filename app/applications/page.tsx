"use client";

import { useEffect, useState } from "react";
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

export default function ApplicationsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

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

  const getTaskTitle = (task: string | PlanTask) => {
    if (typeof task === "string") {
      return task;
    }

    return task.title || "";
  };

  const isTaskComplete = (task: string | PlanTask) => {
    if (typeof task === "string") {
      return false;
    }

    return task.completed === true;
  };

  const getCompletedTasks = (plan: Plan) => {
    return plan.tasks.filter(isTaskComplete).length;
  };

  const getTotalTasks = (plan: Plan) => {
    return plan.tasks.filter((task) => {
      return getTaskTitle(task).trim() !== "";
    }).length;
  };

  const getProgress = (plan: Plan) => {
    const total = getTotalTasks(plan);

    if (total === 0) {
      return 0;
    }

    return Math.round(
      (getCompletedTasks(plan) / total) * 100
    );
  };

  const getStatus = (plan: Plan) => {
    const progress = getProgress(plan);

    if (progress === 100) {
      return "READY TO SUBMIT";
    }

    if (progress > 0) {
      return "IN PROGRESS";
    }

    return "PLANNING";
  };

  const deletePlan = (id: string) => {
    const updatedPlans = plans.filter(
      (plan) => plan.id !== id
    );

    setPlans(updatedPlans);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedPlans)
    );
  };

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
            className="nav-item active"
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
              YOUR OPPORTUNITIES
            </p>

            <h1>
              Applications <span>♡</span>
            </h1>

            <p className="dashboard-subtitle">
              Manage every opportunity and keep
              your applications moving forward.
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

        {/* OVERVIEW */}
        <section className="application-overview">

          <div className="application-overview-intro">

            <p className="section-kicker">
              YOUR APPLICATION SPACE
            </p>

            <h2>
              Keep moving forward.
            </h2>

            <p>
              Track what you've started,
              what you've finished, and what
              still needs your attention.
            </p>

          </div>

          <div className="application-overview-stats">

            <div>
              <strong>
                {plans.length}
              </strong>

              <span>
                Applications
              </span>
            </div>

            <div>
              <strong>
                {plans.filter(
                  (plan) =>
                    getProgress(plan) > 0 &&
                    getProgress(plan) < 100
                ).length}
              </strong>

              <span>
                In progress
              </span>
            </div>

            <div>
              <strong>
                {plans.filter(
                  (plan) =>
                    getProgress(plan) === 100
                ).length}
              </strong>

              <span>
                Ready
              </span>
            </div>

          </div>

        </section>

        {/* APPLICATIONS */}
        <section className="applications-workspace">

          <div className="applications-workspace-heading">

            <div>
              <p className="section-kicker">
                YOUR WORKSPACE
              </p>

              <h2>
                Applications
              </h2>
            </div>

            <span>
              {plans.length}{" "}
              {plans.length === 1
                ? "opportunity"
                : "opportunities"}
            </span>

          </div>

          {plans.length === 0 ? (

            <div className="application-empty">

              <div className="application-empty-symbol">
                ✦
              </div>

              <h3>
                Your application space is empty.
              </h3>

              <p>
                Add your first opportunity and
                HERDAY will turn it into a
                step-by-step application workspace.
              </p>

              <Link
                href="/dashboard"
                className="application-primary-button"
              >
                ＋ Add your first application
              </Link>

            </div>

          ) : (

            <div className="application-workspace-list">

              {plans.map((plan) => {

                const totalTasks =
                  getTotalTasks(plan);

                const completedTasks =
                  getCompletedTasks(plan);

                const progress =
                  getProgress(plan);

                const status =
                  getStatus(plan);

                return (

                  <article
                    className="application-workspace-card"
                    key={plan.id}
                  >

                    {/* TOP */}
                    <div className="application-workspace-top">

                      <div>

                        <span className="application-workspace-type">
                          {plan.type}
                        </span>

                        <h3>
                          {plan.name}
                        </h3>

                        <p>
                          {plan.organization}
                        </p>

                      </div>

                      <span
                        className={`application-workspace-status ${
                          status === "READY TO SUBMIT"
                            ? "ready"
                            : status === "IN PROGRESS"
                            ? "progress"
                            : "planning"
                        }`}
                      >
                        {status}
                      </span>

                    </div>

                    {/* PROGRESS */}
                    <div className="application-progress-section">

                      <div className="application-progress-heading">

                        <span>
                          APPLICATION PROGRESS
                        </span>

                        <strong>
                          {completedTasks} /{" "}
                          {totalTasks} tasks
                        </strong>

                      </div>

                      <div className="application-progress-bar">

                        <div
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                      <span className="application-progress-percent">
                        {progress}% complete
                      </span>

                    </div>

                    {/* TASKS */}
                    <div className="application-checklist">

                      <div className="application-checklist-heading">
                        <span>
                          CHECKLIST
                        </span>

                        <span>
                          {totalTasks} tasks
                        </span>
                      </div>

                      {totalTasks === 0 ? (

                        <p className="application-no-tasks">
                          No tasks added yet.
                        </p>

                      ) : (

                        <div className="application-task-preview">

                          {plan.tasks
                            .filter(
                              (task) =>
                                getTaskTitle(
                                  task
                                ).trim() !== ""
                            )
                            .slice(0, 5)
                            .map(
                              (
                                task,
                                index
                              ) => {

                                const completed =
                                  isTaskComplete(
                                    task
                                  );

                                return (

                                  <div
                                    className={`application-task-preview-row ${
                                      completed
                                        ? "completed"
                                        : ""
                                    }`}
                                    key={index}
                                  >

                                    <span className="application-task-check">
                                      {completed
                                        ? "✓"
                                        : "□"}
                                    </span>

                                    <span>
                                      {getTaskTitle(
                                        task
                                      )}
                                    </span>

                                  </div>

                                );
                              }
                            )}

                        </div>

                      )}

                    </div>

                    {/* BOTTOM */}
                    <div className="application-workspace-bottom">

                      <div className="application-meta">

                        <span>
                          ⏰ Deadline
                        </span>

                        <strong>
                          {new Date(
                            `${plan.deadlineDate}T${plan.deadlineTime}`
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </strong>

                      </div>

                      <div className="application-meta">

                        <span>
                          ◔ Planned time
                        </span>

                        <strong>
                          {plan.hours}h
                        </strong>

                      </div>

                      <button
                        className="application-delete-button"
                        onClick={() =>
                          deletePlan(plan.id)
                        }
                      >
                        Remove
                      </button>

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