import { useState } from "react";

const API_URL = "https://medical-inventory-backend-li17.onrender.com/api";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // GET TOKEN FROM URL
  // =====================================================

  const params = new URLSearchParams(
    window.location.search
  );

  const token = params.get("token");

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Check token
    if (!token) {
      setError(
        "Invalid password reset link."
      );
      return;
    }

    // Check password
    if (!newPassword) {
      setError(
        "Please enter your new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    // Check confirmation
    if (newPassword !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            token: token,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to reset password."
        );
      }

      setMessage(
        "Password reset successfully! Redirecting to login..."
      );

      setNewPassword("");
      setConfirmPassword("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (err) {
      console.error(
        "Reset password error:",
        err
      );

      setError(
        err.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INVALID TOKEN
  // =====================================================

  if (!token) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f4f7fb",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "420px",
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#dc2626",
              marginBottom: "15px",
            }}
          >
            Invalid Reset Link
          </h1>

          <p
            style={{
              color: "#666",
              marginBottom: "25px",
            }}
          >
            This password reset link is
            invalid or incomplete.
          </p>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#1976f3",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // RESET PASSWORD PAGE
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "55px",
              height: "55px",
              margin: "0 auto 15px",
              borderRadius: "12px",
              background: "#1976f3",
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            +
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              color: "#172033",
              fontSize: "28px",
            }}
          >
            Reset Password
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
            }}
          >
            Create a new password for your
            MedInventory account.
          </p>
        </div>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div
            style={{
              background: "#ecfdf5",
              color: "#047857",
              border: "1px solid #a7f3d0",
              padding: "14px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            ✓ {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              padding: "14px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* NEW PASSWORD */}

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Enter new password"
              minLength={6}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "15px",
                outline: "none",
              }}
            />

            <small
              style={{
                color: "#6b7280",
                display: "block",
                marginTop: "6px",
              }}
            >
              Use at least 6 characters.
            </small>
          </div>

          {/* CONFIRM PASSWORD */}

          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm new password"
              minLength={6}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "15px",
                outline: "none",
              }}
            />
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "8px",
              background: loading
                ? "#93c5fd"
                : "#1976f3",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password →"}
          </button>

        </form>

        {/* BACK TO LOGIN */}

        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              background: "none",
              border: "none",
              color: "#1976f3",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
