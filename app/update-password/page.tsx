"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function UpdatePassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password: password,
      });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccess(true);

    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  return (
    <main className="forgot-page">

      <div className="forgot-card">

        <div className="herday-small">
          HERDAY
        </div>

        <div className="forgot-icon">
          ♡
        </div>

        {!success ? (
          <>
            <h1>
              Create New Password
            </h1>

            <p className="subtitle">
              Choose a new password for
              your HERDAY account.
            </p>

            <form onSubmit={handleSubmit}>

              <label htmlFor="password">
                New Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter new password"
                required
              />

              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
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
                    ? "UPDATING..."
                    : "UPDATE PASSWORD"}
                </span>

                {!loading && (
                  <span className="arrow">
                    →
                  </span>
                )}
              </button>

            </form>
          </>
        ) : (
          <>
            <div className="forgot-icon">
              ✓
            </div>

            <h1>
              Password Updated!
            </h1>

            <p className="subtitle">
              Your password has been changed
              successfully.
              <br />
              Taking you back to sign in...
            </p>
          </>
        )}

      </div>

    </main>
  );
}