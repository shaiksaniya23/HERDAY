"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  const [isSignup, setIsSignup] = useState(false);

  // SIGN IN STATES
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);
  const [signinError, setSigninError] = useState("");

  // SIGN UP STATES
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  // =========================
  // SIGN IN
  // =========================

  const handleSignIn = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSigninError("");
    setSigninLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: signinEmail,
      password: signinPassword,
    });

    setSigninLoading(false);

    if (error) {
      setSigninError(error.message);
      return;
    }

    router.push("/dashboard");
  };

  // =========================
  // SIGN UP
  // =========================

  const handleSignUp = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSignupError("");
    setSignupSuccess("");
    setSignupLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          name: signupName,
        },
      },
    });

    setSignupLoading(false);

    if (error) {
      setSignupError(error.message);
      return;
    }

    /*
      If email confirmation is enabled in Supabase,
      session will be null until the user confirms
      their email.
    */

    if (data.session) {
      router.push("/dashboard");
      return;
    }

    setSignupSuccess(
      "Account created! Please check your email to confirm your account."
    );
  };

  return (
    <main className="login-page">

      <div className={`login-card ${isSignup ? "signup-mode" : ""}`}>

        {/* =========================
            SIGN IN
        ========================= */}

        <section className="auth-form signin-form">

          <div className="herday-small">
            HERDAY
          </div>

          <h1>Welcome Back ♡</h1>

          <p className="subtitle">
            Sign in to continue your journey.
          </p>

          <form onSubmit={handleSignIn}>

            <label htmlFor="signin-email">
              Email
            </label>

            <input
              id="signin-email"
              type="email"
              placeholder="Enter your email"
              value={signinEmail}
              onChange={(e) =>
                setSigninEmail(e.target.value)
              }
              required
            />

            <label htmlFor="signin-password">
              Password
            </label>

            <input
              id="signin-password"
              type="password"
              placeholder="Enter your password"
              value={signinPassword}
              onChange={(e) =>
                setSigninPassword(e.target.value)
              }
              required
            />

            <div className="forgot">
              <a href="/forgot-password">
                Forgot password?
              </a>
            </div>

            {signinError && (
              <p
                style={{
                  color: "#306D29",
                  fontSize: "14px",
                  marginTop: "8px",
                  marginBottom: "8px",
                }}
              >
                {signinError}
              </p>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={signinLoading}
            >
              <span>
                {signinLoading
                  ? "SIGNING IN..."
                  : "SIGN IN"}
              </span>

              {!signinLoading && (
                <span className="arrow">
                  →
                </span>
              )}
            </button>

          </form>

          <div className="or">
            <span />
            <p>or</p>
            <span />
          </div>

          <button
            type="button"
            className="google-button"
          >
            <span className="google-icon">
              G
            </span>

            Continue with Google
          </button>

          <p className="switch-text">

            Don't have an account?

            <button
              type="button"
              onClick={() => {
                setSigninError("");
                setIsSignup(true);
              }}
            >
              Sign up
            </button>

          </p>

        </section>


        {/* =========================
            SIGN UP
        ========================= */}

        <section className="auth-form signup-form">

          <div className="herday-small">
            HERDAY
          </div>

          <h1>Create Account ♡</h1>

          <p className="subtitle">
            Start organizing your future.
          </p>

          <form onSubmit={handleSignUp}>

            <label htmlFor="signup-name">
              Name
            </label>

            <input
              id="signup-name"
              type="text"
              placeholder="Your name"
              value={signupName}
              onChange={(e) =>
                setSignupName(e.target.value)
              }
              required
            />

            <label htmlFor="signup-email">
              Email
            </label>

            <input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={signupEmail}
              onChange={(e) =>
                setSignupEmail(e.target.value)
              }
              required
            />

            <label htmlFor="signup-password">
              Password
            </label>

            <input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={signupPassword}
              onChange={(e) =>
                setSignupPassword(e.target.value)
              }
              required
            />

            {signupError && (
              <p
                style={{
                  color: "#306D29",
                  fontSize: "14px",
                  marginTop: "8px",
                  marginBottom: "8px",
                }}
              >
                {signupError}
              </p>
            )}

            {signupSuccess && (
              <p
                style={{
                  color: "#306D29",
                  fontSize: "14px",
                  marginTop: "8px",
                  marginBottom: "8px",
                }}
              >
                {signupSuccess}
              </p>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={signupLoading}
            >
              <span>
                {signupLoading
                  ? "CREATING..."
                  : "SIGN UP"}
              </span>

              {!signupLoading && (
                <span className="arrow">
                  →
                </span>
              )}
            </button>

          </form>

          <div className="or">
            <span />
            <p>or</p>
            <span />
          </div>

          <button
            type="button"
            className="google-button"
          >
            <span className="google-icon">
              G
            </span>

            Continue with Google
          </button>

          <p className="switch-text">

            Already have an account?

            <button
              type="button"
              onClick={() => {
                setSignupError("");
                setSignupSuccess("");
                setIsSignup(false);
              }}
            >
              Sign in
            </button>

          </p>

        </section>


        {/* =========================
            HERDAY BRAND PANEL
        ========================= */}

        <section className="brand-panel">

          <div className="brand-content">

            <div className="brand-symbol">
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

          </div>

        </section>

      </div>

    </main>
  );
}