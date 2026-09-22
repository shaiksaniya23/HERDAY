"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            "http://localhost:3000/update-password",
        }
      );

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSubmitted(true);
  };

  return (
    <main className="forgot-page">

      <div className="forgot-card">

        <div className="herday-small">
          HERDAY
        </div>

        {!submitted ? (
          <>
            <div className="forgot-icon">
              ♡
            </div>

            <h1>
              Forgot Password?
            </h1>

            <p className="subtitle">
              No worries. Enter your email and we'll
              help you reset your password.
            </p>

            <form onSubmit={handleSubmit}>

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
              />

              {errorMessage && (
                <p className="forgot-error">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "SENDING..."
                    : "SEND RESET LINK"}
                </span>

                {!loading && (
                  <span className="arrow">
                    →
                  </span>
                )}
              </button>

            </form>

            <a
              href="/"
              className="back-login"
            >
              ← Back to Sign In
            </a>
          </>
        ) : (
          <>
            <div className="forgot-icon">
              ✦
            </div>

            <h1>
              Check Your Email ♡
            </h1>

            <p className="subtitle">
              If an account exists with that email,
              we've sent instructions to reset
              your password.
            </p>

            <a
              href="/"
              className="auth-button back-button"
            >
              BACK TO SIGN IN
            </a>
          </>
        )}

      </div>

    </main>
  );
}