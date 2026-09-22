"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PlanTask = {
  id: string;
  title: string;
  completed: boolean;
};

type Plan = {
  id: string;
  type: string;
  name: string;
  organization: string;
  deadlineDate: string;
  deadlineTime: string;
  tasks: PlanTask[];
  hours: number;
  plannedDate: string;
  plannedTime: string;
  reminder: string;
};

const STORAGE_KEY = "herday-plans";

function normalizePlans(rawPlans: any[]): Plan[] {
  return rawPlans.map((plan) => ({
    ...plan,

    tasks: (plan.tasks || [])
      .map((task: any, index: number) => {
        if (typeof task === "string") {
          return {
            id: `${plan.id}-task-${index}`,
            title: task,
            completed: false,
          };
        }

        return {
          id:
            task.id ||
            `${plan.id}-task-${index}`,
          title:
            task.title ||
            task.name ||
            "",
          completed:
            task.completed === true,
        };
      })
      .filter((task: PlanTask) =>
        task.title.trim() !== ""
      ),
  }));
}

export default function TasksPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(
      STORAGE_KEY
    );

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalized =
          normalizePlans(parsed);

        setPlans(normalized);

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(normalized)
        );
      } catch {
        setPlans([]);
      }
    }
  }, []);

  const toggleTask = (
    planId: string,
    taskId: string
  ) => {
    const updatedPlans = plans.map((plan) => {
      if (plan.id !== planId) {
        return plan;
      }

      return {
        ...plan,

        tasks: plan.tasks.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          return {
            ...task,
            completed: !task.completed,
          };
        }),
      };
    });

    setPlans(updatedPlans);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedPlans)
    );
  };

  const totalTasks = plans.reduce(
    (total, plan) =>
      total + plan.tasks.length,
    0
  );

  const completedTasks = plans.reduce(
    (total, plan) =>
      total +
      plan.tasks.filter(
        (task) => task.completed
      ).length,
    0
  );

  const remainingTasks =
    totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

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
            className="nav-item"
          >
            <span>◷</span>
            Deadlines
          </Link>

          <Link
            href="/tasks"
            className="nav-item active"
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
              ONE STEP AT A TIME
            </p>

            <h1>
              Tasks <span>♡</span>
            </h1>

            <p className="dashboard-subtitle">
              Focus on what needs to get done today.
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

        {/* FOCUS CARD */}

        <section className="tasks-focus-card">

          <div>

            <p>
              YOUR PROGRESS
            </p>

            <h2>
              Keep going.
            </h2>

            <span>
              {completedTasks} of{" "}
              {totalTasks} tasks completed
            </span>

          </div>

          <div className="tasks-progress-circle">

            <strong>
              {progress}%
            </strong>

            <span>
              done
            </span>

          </div>

        </section>

        {/* SUMMARY */}

        <div className="tasks-summary">

          <div>
            <strong>
              {remainingTasks}
            </strong>

            <span>
              remaining
            </span>
          </div>

          <div>
            <strong>
              {completedTasks}
            </strong>

            <span>
              completed
            </span>
          </div>

          <div>
            <strong>
              {plans.length}
            </strong>

            <span>
              applications
            </span>
          </div>

        </div>

        {/* TASKS */}

        <section className="tasks-workspace">

          <div className="tasks-workspace-heading">

            <div>

              <p className="section-kicker">
                YOUR WORK
              </p>

              <h2>
                All tasks
              </h2>

            </div>

          </div>

          {plans.length === 0 ? (

            <div className="application-empty">

              <div className="application-empty-symbol">
                ✓
              </div>

              <h3>
                No tasks yet.
              </h3>

              <p>
                Add an application and its tasks
                will appear here automatically.
              </p>

              <Link
                href="/dashboard"
                className="application-primary-button"
              >
                ＋ Add your first plan
              </Link>

            </div>

          ) : (

            <div className="task-application-groups">

              {plans.map((plan) => {

                const unfinished =
                  plan.tasks.filter(
                    (task) =>
                      !task.completed
                  );

                const finished =
                  plan.tasks.filter(
                    (task) =>
                      task.completed
                  );

                if (
                  plan.tasks.length === 0
                ) {
                  return null;
                }

                return (

                  <div
                    className="task-application-group"
                    key={plan.id}
                  >

                    <div className="task-group-header">

                      <div>

                        <span>
                          {plan.type}
                        </span>

                        <h3>
                          {plan.name}
                        </h3>

                        <p>
                          {plan.organization}
                        </p>

                      </div>

                      <strong>
                        {
                          finished.length
                        }
                        /
                        {
                          plan.tasks.length
                        }
                      </strong>

                    </div>

                    {/* UNFINISHED */}

                    {unfinished.length >
                      0 && (

                      <div className="task-group-section">

                        <p>
                          TO DO
                        </p>

                        {unfinished.map(
                          (task) => (

                            <button
                              key={task.id}
                              className="working-task-row"
                              onClick={() =>
                                toggleTask(
                                  plan.id,
                                  task.id
                                )
                              }
                            >

                              <span className="working-task-checkbox">
                                □
                              </span>

                              <span>
                                {task.title}
                              </span>

                            </button>

                          )
                        )}

                      </div>

                    )}

                    {/* COMPLETED */}

                    {finished.length >
                      0 && (

                      <div className="task-group-section completed-section">

                        <p>
                          COMPLETED
                        </p>

                        {finished.map(
                          (task) => (

                            <button
                              key={task.id}
                              className="working-task-row completed-task"
                              onClick={() =>
                                toggleTask(
                                  plan.id,
                                  task.id
                                )
                              }
                            >

                              <span className="working-task-checkbox">
                                ✓
                              </span>

                              <span>
                                {task.title}
                              </span>

                            </button>

                          )
                        )}

                      </div>

                    )}

                  </div>

                );
              })}

            </div>

          )}

        </section>

      </section>

    </main>
  );
}