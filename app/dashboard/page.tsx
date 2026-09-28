"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

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
  reminder: string;
};

const STORAGE_KEY = "herday-plans";

const emptyForm = {
  type: "Scholarship",
  name: "",
  organization: "",
  deadlineDate: "",
  deadlineTime: "23:59",
  tasks: [""],
  hours: "2",
  plannedDate: "",
  reminder: "24 hours before",
};

/* =========================================
   NORMALIZE OLD TASK DATA
   ========================================= */

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
      .filter(
        (task: PlanTask) =>
          task.title.trim() !== ""
      ),
  }));
}

/* =========================================
   CONVERT SUPABASE PLAN → HERDAY PLAN
   ========================================= */

function convertSupabasePlan(
  databasePlan: any
): Plan {
  const deadline = new Date(
    databasePlan.deadline
  );

  let reminder = "24 hours before";

  if (
    databasePlan.reminder_24h &&
    databasePlan.reminder_6h &&
    databasePlan.reminder_1h
  ) {
    reminder =
      "24, 6 and 1 hour before";
  } else if (
    databasePlan.reminder_24h &&
    databasePlan.reminder_6h
  ) {
    reminder =
      "24 and 6 hours before";
  } else if (
    databasePlan.reminder_6h
  ) {
    reminder =
      "6 hours before";
  } else if (
    databasePlan.reminder_1h
  ) {
    reminder =
      "1 hour before";
  } else if (
    databasePlan.reminder_24h
  ) {
    reminder =
      "24 hours before";
  }

  const databaseTasks =
    Array.isArray(databasePlan.tasks)
      ? databasePlan.tasks
      : [];

  return {
    id: databasePlan.id,

    type:
      databasePlan.type || "Other",

    name:
      databasePlan.title || "",

    organization:
      databasePlan.organization || "",

    deadlineDate:
      Number.isNaN(deadline.getTime())
        ? ""
        : `${deadline.getFullYear()}-${String(
            deadline.getMonth() + 1
          ).padStart(2, "0")}-${String(
            deadline.getDate()
          ).padStart(2, "0")}`,

    deadlineTime:
      Number.isNaN(deadline.getTime())
        ? "23:59"
        : `${String(
            deadline.getHours()
          ).padStart(2, "0")}:${String(
            deadline.getMinutes()
          ).padStart(2, "0")}`,

    tasks: normalizePlans([
      {
        id: databasePlan.id,
        tasks: databaseTasks,
      },
    ])[0].tasks,

    hours:
      Number(
        databasePlan.estimated_hours
      ) || 0,

    plannedDate:
      databasePlan.planned_date || "",

    reminder,
  };
}

/* =========================================
   DATE HELPERS
   ========================================= */

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPlanDeadline(
  plan: Plan
) {
  return new Date(
    `${plan.deadlineDate}T${plan.deadlineTime}`
  );
}

function isPlanCompleted(plan: Plan) {
  return (
    plan.tasks.length > 0 &&
    plan.tasks.every(
      (task) => task.completed
    )
  );
}

/* =========================================
   DASHBOARD
   ========================================= */

export default function Dashboard() {
  const [showPlanForm, setShowPlanForm] =
    useState(false);

  const [plans, setPlans] =
    useState<Plan[]>([]);

  const [form, setForm] =
    useState(emptyForm);

  const [savedMessage, setSavedMessage] =
    useState("");

  const [savingPlan, setSavingPlan] =
    useState(false);

  const [currentHour, setCurrentHour] =
    useState(() => new Date().getHours());

  /* =========================================
     LOAD PLANS — SUPABASE IS THE SOURCE OF TRUTH
     ========================================= */

  useEffect(() => {
    const loadPlans = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPlans([]);
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const {
        data: databasePlans,
        error,
      } = await supabase
        .from("plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "HERDAY plan load error:",
          error
        );

        setSavedMessage(
          `Could not load your plans: ${error.message}`
        );
        return;
      }

      /*
        IMPORTANT:
        An empty Supabase result means the user really has
        no plans. We MUST NOT restore old localStorage data.
        This is what makes Settings → Clear Data actually stay cleared.
      */

      const convertedPlans =
        (databasePlans || []).map(
          convertSupabasePlan
        );

      setPlans(convertedPlans);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(convertedPlans)
      );
    };

    loadPlans();

    /*
      If Settings clears data while another HERDAY page is open,
      reload the dashboard from Supabase instead of keeping stale data.
    */
    const reloadAfterClear = () => {
      loadPlans();
    };

    window.addEventListener(
      "herday-data-cleared",
      reloadAfterClear
    );

    return () => {
      window.removeEventListener(
        "herday-data-cleared",
        reloadAfterClear
      );
    };
  }, []);

  /* Keep the greeting correct if the page stays open across noon/5 PM. */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);


  /* =========================================
     SAVE PLANS LOCALLY
     ========================================= */

  const savePlans = (
    newPlans: Plan[]
  ) => {
    setPlans(newPlans);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newPlans)
    );
  };

  /* =========================================
     OPEN / CLOSE FORM
     ========================================= */

  const openPlanForm = () => {
    setSavedMessage("");
    setShowPlanForm(true);
  };

  const closePlanForm = () => {
    setShowPlanForm(false);
    setForm(emptyForm);
    setSavedMessage("");
  };

  /* =========================================
     FORM HELPERS
     ========================================= */

  const updateForm = (
    field: keyof typeof emptyForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateTask = (
    index: number,
    value: string
  ) => {
    setForm((previous) => {
      const updatedTasks = [
        ...previous.tasks,
      ];

      updatedTasks[index] = value;

      return {
        ...previous,
        tasks: updatedTasks,
      };
    });
  };

  const addTask = () => {
    setForm((previous) => ({
      ...previous,
      tasks: [
        ...previous.tasks,
        "",
      ],
    }));
  };

  const removeTask = (
    index: number
  ) => {
    setForm((previous) => {
      const updatedTasks =
        previous.tasks.filter(
          (_, taskIndex) =>
            taskIndex !== index
        );

      return {
        ...previous,
        tasks:
          updatedTasks.length > 0
            ? updatedTasks
            : [""],
      };
    });
  };

  /* =========================================
     SAVE NEW PLAN
     ========================================= */

  const handleSavePlan = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (savingPlan) return;

    setSavedMessage("");

    const name = form.name.trim();
    const organization = form.organization.trim();

    if (!name || !organization || !form.deadlineDate) {
      setSavedMessage(
        "Please fill in the application name, organization and deadline."
      );
      return;
    }

    const deadline = new Date(
      `${form.deadlineDate}T${form.deadlineTime}`
    );

    if (Number.isNaN(deadline.getTime())) {
      setSavedMessage("Please enter a valid deadline.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavedMessage("Please sign in again before saving a plan.");
      return;
    }

    const cleanedTasks = form.tasks
      .map((task) => task.trim())
      .filter(Boolean)
      .map((task, index) => ({
        id: `${Date.now()}-task-${index}`,
        title: task,
        completed: false,
      }));

    const reminder24h =
      form.reminder === "24 hours before" ||
      form.reminder === "24 and 6 hours before" ||
      form.reminder === "24, 6 and 1 hour before";

    const reminder6h =
      form.reminder === "6 hours before" ||
      form.reminder === "24 and 6 hours before" ||
      form.reminder === "24, 6 and 1 hour before";

    const reminder1h =
      form.reminder === "1 hour before" ||
      form.reminder === "24, 6 and 1 hour before";

    setSavingPlan(true);

    try {
      const {
        data: insertedPlan,
        error,
      } = await supabase
        .from("plans")
        .insert({
          user_id: user.id,
          title: name,
          organization,
          type: form.type,
          deadline: deadline.toISOString(),
          estimated_hours: Number(form.hours) || 0,
          planned_date: form.plannedDate || null,
          reminder_24h: reminder24h,
          reminder_6h: reminder6h,
          reminder_1h: reminder1h,
          tasks: cleanedTasks,
        })
        .select("*")
        .single();

      if (error || !insertedPlan) {
        console.error("HERDAY plan save error:", error);
        setSavedMessage(
          `Could not save plan: ${error?.message || "No plan was returned by Supabase."}`
        );
        return;
      }

      const newPlan = convertSupabasePlan(insertedPlan);
      const updatedPlans = [...plans, newPlan];

      setPlans(updatedPlans);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedPlans)
      );

      setSavedMessage("Plan saved successfully ♡");

      window.setTimeout(() => {
        closePlanForm();
      }, 700);
    } finally {
      setSavingPlan(false);
    }
  };

  /* =========================================
     DELETE PLAN
     ========================================= */

  const deletePlan = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavedMessage("Please sign in again before deleting a plan.");
      return;
    }

    const { error } = await supabase
      .from("plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("HERDAY delete error:", error);
      setSavedMessage(
        `Could not delete plan: ${error.message}`
      );
      return;
    }

    const updatedPlans = plans.filter(
      (plan) => plan.id !== id
    );

    savePlans(updatedPlans);
  };

  /* =========================================
     TOGGLE TASK
     ========================================= */

  const toggleTask = async (
    planId: string,
    taskId: string
  ) => {
    const changedPlan = plans.find(
      (plan) => plan.id === planId
    );

    if (!changedPlan) return;

    const updatedTasks = changedPlan.tasks.map(
      (task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSavedMessage("Please sign in again before updating a task.");
      return;
    }

    const { error } = await supabase
      .from("plans")
      .update({ tasks: updatedTasks })
      .eq("id", planId)
      .eq("user_id", user.id);

    if (error) {
      console.error("HERDAY task update error:", error);
      setSavedMessage(
        `Could not update task: ${error.message}`
      );
      return;
    }

    const updatedPlans = plans.map(
      (plan) =>
        plan.id === planId
          ? { ...plan, tasks: updatedTasks }
          : plan
    );

    savePlans(updatedPlans);
  };

  /* =========================================
     ACTIVE PLANS
     ========================================= */

  const activePlans =
    useMemo(() => {
      return plans.filter(
        (plan) =>
          !isPlanCompleted(plan)
      );
    }, [plans]);

  /* =========================================
     TODAY'S FOCUS
     ========================================= */

  const today = getTodayString();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
      ? "Good afternoon"
      : "Good evening";

  const todayPlans =
    useMemo(() => {
      return plans.filter(
        (plan) =>
          plan.plannedDate === today
      );
    }, [plans, today]);

  const totalPlannedHours =
    useMemo(() => {
      return todayPlans.reduce(
        (total, plan) =>
          total + plan.hours,
        0
      );
    }, [todayPlans]);

  /* =========================================
     TASK COUNTS
     ========================================= */

  const totalTasks =
    useMemo(() => {
      return plans.reduce(
        (total, plan) =>
          total +
          plan.tasks.length,
        0
      );
    }, [plans]);

  const completedTasks =
    useMemo(() => {
      return plans.reduce(
        (total, plan) =>
          total +
          plan.tasks.filter(
            (task) =>
              task.completed
          ).length,
        0
      );
    }, [plans]);

  /* =========================================
     DEADLINE FORMAT
     ========================================= */

  const formatDeadline = (
    date: string,
    time: string
  ) => {
    const deadline =
      new Date(
        `${date}T${time}`
      );

    if (
      Number.isNaN(
        deadline.getTime()
      )
    ) {
      return date;
    }

    return deadline.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  /* =========================================
     UPCOMING PLANS
     ========================================= */

  const upcomingPlans =
    useMemo(() => {
      return [...activePlans]
        .sort(
          (a, b) =>
            getPlanDeadline(a).getTime() -
            getPlanDeadline(b).getTime()
        )
        .slice(0, 4);
    }, [activePlans]);

  /* =========================================
     TODAY'S TASKS
     ========================================= */

  const displayedTasks =
    useMemo(() => {
      return plans
        .flatMap((plan) =>
          plan.tasks.map(
            (task) => ({
              task,
              planId: plan.id,
              planName:
                plan.name,
            })
          )
        )
        .slice(0, 6);
    }, [plans]);

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
            className="nav-item active"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <button
            className="nav-item"
            onClick={
              openPlanForm
            }
          >
            <span>＋</span>
            Add Plan
          </button>

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
              YOUR DAY, YOUR WAY
            </p>

            <h1>
              {greeting}{" "}
              <span>♡</span>
            </h1>

            <p className="dashboard-subtitle">
              Let's see what needs your
              attention today.
            </p>

          </div>

          <button
            className="header-add-button"
            onClick={
              openPlanForm
            }
          >
            <span>＋</span>
            Add Plan
          </button>

        </header>

        {/* =====================================
            STATS
            ===================================== */}

        <section className="dashboard-stats">

          {/* FOCUS */}

          <div className="stat-card focus-card">

            <div className="stat-card-top">

              <span className="stat-label">
                TODAY'S FOCUS
              </span>

              <span className="stat-icon">
                ◔
              </span>

            </div>

            <div className="focus-content">

              <div className="focus-ring">

                <div className="focus-ring-inner">

                  <strong>
                    {totalPlannedHours}
                  </strong>

                  <span>
                    / 6h
                  </span>

                </div>

              </div>

              <div className="focus-text">

                <strong>
                  6 hours
                </strong>

                <p>
                  Your daily focus goal
                </p>

              </div>

            </div>

          </div>

          {/* UPCOMING */}

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
              {activePlans.length}
            </div>

            <p className="stat-description">
              deadlines being tracked
            </p>

          </div>

          {/* TASKS */}

          <div className="stat-card">

            <div className="stat-card-top">

              <span className="stat-label">
                TASKS
              </span>

              <span className="stat-icon">
                ✓
              </span>

            </div>

            <div className="stat-number">
              {totalTasks}
            </div>

            <p className="stat-description">
              {completedTasks} completed
            </p>

          </div>

        </section>

        {/* =====================================
            CONTENT GRID
            ===================================== */}

        <section className="dashboard-content-grid">

          {/* DEADLINES */}

          <div className="dashboard-section-card">

            <div className="section-heading">

              <div>

                <p className="section-kicker">
                  KEEP AN EYE ON
                </p>

                <h2>
                  Upcoming deadlines
                </h2>

              </div>

              {activePlans.length > 0 && (

                <Link
                  href="/deadlines"
                  className="section-link"
                >
                  View all
                </Link>

              )}

            </div>

            {activePlans.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ♡
                </div>

                <h3>
                  Nothing on your
                  calendar yet
                </h3>

                <p>
                  Add an application or
                  important deadline and
                  HERDAY will keep track
                  of it for you.
                </p>

                <button
                  className="empty-button"
                  onClick={
                    openPlanForm
                  }
                >
                  ＋ Add your first plan
                </button>

              </div>

            ) : (

              <div className="plans-list">

                {upcomingPlans.map(
                  (plan) => (

                    <div
                      className="plan-card"
                      key={plan.id}
                    >

                      <div className="plan-card-main">

                        <div className="plan-type">
                          {plan.type}
                        </div>

                        <h3>
                          {plan.name}
                        </h3>

                        <p>
                          {plan.organization}
                        </p>

                        <div className="plan-meta">

                          <span>
                            📅{" "}
                            {formatDeadline(
                              plan.deadlineDate,
                              plan.deadlineTime
                            )}
                          </span>

                          <span>
                            ⏰{" "}
                            {plan.deadlineTime}
                          </span>

                          {plan.plannedDate && (
                            <span>
                              🗓️ Work: {plan.plannedDate}
                            </span>
                          )}

                        </div>

                      </div>

                      <button
                        className="delete-plan"
                        onClick={() =>
                          deletePlan(
                            plan.id
                          )
                        }
                        aria-label="Delete plan"
                      >
                        ×
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* TASKS */}

          <div className="dashboard-section-card">

            <div className="section-heading">

              <div>

                <p className="section-kicker">
                  FOR TODAY
                </p>

                <h2>
                  Your tasks
                </h2>

              </div>

              {totalTasks > 0 && (

                <Link
                  href="/tasks"
                  className="section-link"
                >
                  View all
                </Link>

              )}

            </div>

            {totalTasks === 0 ? (

              <div className="task-empty">

                <div className="task-empty-icon">
                  ✓
                </div>

                <h3>
                  Your task list is clear
                </h3>

                <p>
                  Once you add a plan,
                  your tasks will appear
                  here.
                </p>

              </div>

            ) : (

              <div className="task-list">

                {displayedTasks.map(
                  (item) => (

                    <div
                      className={`task-row ${
                        item.task.completed
                          ? "completed-dashboard-task"
                          : ""
                      }`}
                      key={
                        item.task.id
                      }
                    >

                      <button
                        type="button"
                        className="task-checkbox"
                        onClick={() =>
                          toggleTask(
                            item.planId,
                            item.task.id
                          )
                        }
                        aria-label={
                          item.task.completed
                            ? "Mark task incomplete"
                            : "Mark task complete"
                        }
                      >
                        {item.task.completed
                          ? "✓"
                          : "□"}
                      </button>

                      <Link
                        href="/tasks"
                        className="dashboard-task-content"
                      >

                        <strong>
                          {item.task.title}
                        </strong>

                        <span>
                          {item.planName}
                        </span>

                      </Link>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>

        {/* =====================================
            QUICK ADD
            ===================================== */}

        <section className="quick-add-card">

          <div>

            <p className="section-kicker">
              SOMETHING COMING UP?
            </p>

            <h2>
              Tell HERDAY about it.
            </h2>

            <p>
              Add an application,
              deadline, event or anything
              you don't want to forget.
            </p>

          </div>

          <button
            className="quick-add-button"
            onClick={
              openPlanForm
            }
          >
            Add a plan
            <span>→</span>
          </button>

        </section>

      </section>

      {/* =====================================
          ADD PLAN MODAL
          ===================================== */}

      {showPlanForm && (

        <div
          className="plan-overlay"
          onClick={
            closePlanForm
          }
        >

          <div
            className="plan-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-modal"
              onClick={
                closePlanForm
              }
              aria-label="Close"
            >
              ×
            </button>

            <p className="section-kicker">
              LET'S PLAN IT
            </p>

            <h2>
              Add a new plan ♡
            </h2>

            <p className="modal-description">
              Tell HERDAY what's coming up
              and we'll organize it for you.
            </p>

            <form
              className="plan-form"
              onSubmit={
                handleSavePlan
              }
            >

              {/* TYPE */}

              <label>
                What are you applying for?

                <select
                  value={
                    form.type
                  }
                  onChange={(e) =>
                    updateForm(
                      "type",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Scholarship
                  </option>

                  <option>
                    Internship
                  </option>

                  <option>
                    Job
                  </option>

                  <option>
                    Fellowship
                  </option>

                  <option>
                    Competition
                  </option>

                  <option>
                    College Application
                  </option>

                  <option>
                    Other
                  </option>
                </select>

              </label>

              {/* NAME */}

              <label>
                Application name

                <input
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(e) =>
                    updateForm(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Google Summer Internship"
                  required
                />

              </label>

              {/* ORGANIZATION */}

              <label>
                Organization

                <input
                  type="text"
                  value={
                    form.organization
                  }
                  onChange={(e) =>
                    updateForm(
                      "organization",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Google"
                  required
                />

              </label>

              {/* DEADLINE */}

              <div className="form-two-columns">

                <label>
                  Deadline date

                  <input
                    type="date"
                    value={
                      form.deadlineDate
                    }
                    onChange={(e) =>
                      updateForm(
                        "deadlineDate",
                        e.target.value
                      )
                    }
                    required
                  />

                </label>

                <label>
                  Deadline time

                  <input
                    type="time"
                    value={
                      form.deadlineTime
                    }
                    onChange={(e) =>
                      updateForm(
                        "deadlineTime",
                        e.target.value
                      )
                    }
                    required
                  />

                </label>

              </div>

              {/* TASKS */}

              <div className="form-task-section">

                <div className="form-section-title">
                  What needs to be completed?
                </div>

                {form.tasks.map(
                  (
                    task,
                    index
                  ) => (

                    <div
                      className="task-input-row"
                      key={index}
                    >

                      <span>
                        □
                      </span>

                      <input
                        type="text"
                        value={task}
                        onChange={(e) =>
                          updateTask(
                            index,
                            e.target.value
                          )
                        }
                        placeholder={`Task ${
                          index + 1
                        }`}
                      />

                      {form.tasks.length >
                        1 && (

                        <button
                          type="button"
                          className="remove-task"
                          onClick={() =>
                            removeTask(
                              index
                            )
                          }
                        >
                          ×
                        </button>

                      )}

                    </div>

                  )
                )}

                <button
                  type="button"
                  className="add-task-button"
                  onClick={
                    addTask
                  }
                >
                  ＋ Add another task
                </button>

              </div>

              {/* HOURS */}

              <label>
                How much time will you need?

                <div className="input-with-suffix">

                  <input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={
                      form.hours
                    }
                    onChange={(e) =>
                      updateForm(
                        "hours",
                        e.target.value
                      )
                    }
                  />

                  <span>
                    hours
                  </span>

                </div>

              </label>

              {/* PLANNED WORK */}

              <div className="form-section-title">
                When do you plan to work on it?
              </div>

              <label>
                Work date

                <input
                  type="date"
                  value={
                    form.plannedDate
                  }
                  onChange={(e) =>
                    updateForm(
                      "plannedDate",
                      e.target.value
                    )
                  }
                />

              </label>

              {/* REMINDER */}

              <label>
                When should HERDAY remind you?

                <select
                  value={
                    form.reminder
                  }
                  onChange={(e) =>
                    updateForm(
                      "reminder",
                      e.target.value
                    )
                  }
                >

                  <option>
                    24 hours before
                  </option>

                  <option>
                    6 hours before
                  </option>

                  <option>
                    1 hour before
                  </option>

                  <option>
                    24 and 6 hours before
                  </option>

                  <option>
                    24, 6 and 1 hour before
                  </option>

                </select>

              </label>

              {/* SAVED MESSAGE */}

              {savedMessage && (

                <div className="saved-message">
                  {savedMessage}
                </div>

              )}

              {/* SAVE */}

              <button
                type="submit"
                className="save-plan-button"
                disabled={savingPlan}
              >
                {savingPlan ? "SAVING..." : "SAVE PLAN"}
                {!savingPlan && <span>→</span>}
              </button>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}