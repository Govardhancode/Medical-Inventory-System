import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(
        "https://medical-inventory-system-vtbs.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          data?.message ||
            (typeof data === "string"
              ? data
              : "Incorrect email or password.")
        );
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberLogin", "true");
      }

      localStorage.setItem("isLoggedIn", "true");

      // Store logged-in user information if returned
      if (data) {
        localStorage.setItem(
          "medicalInventoryUser",
          JSON.stringify(data)
        );
      }

      if (onLogin) {
        onLogin();
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(
        "Please enter your email address first."
      );
      return;
    }

    if (!email.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(
        "https://medical-inventory-system-vtbs.onrender.com/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to send password reset request."
        );
      }

      /*
       * We intentionally show our own friendly message
       * instead of displaying the backend response.
       */

      setSuccess(
        "Password reset link has been sent to your email. Please check both your spam folder and inbox to get the reset link."
      );
    } catch (err) {
      console.error(
        "Forgot password error:",
        err
      );

      setError(
        "Unable to send the password reset link. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div className="auth-left">

          <div className="brand-section">
            <div className="brand-logo">
              +
            </div>

            <h1>
              MedInventory
            </h1>
          </div>

          <div className="welcome-section">

            <span className="welcome-badge">
              Medical Inventory Management
            </span>

            <h2>
              Manage your medical inventory
              <span> smarter.</span>
            </h2>

            <p>
              A simple and powerful platform to manage
              medicines, stock, customers, billing and reports
              from one place.
            </p>

            <div className="feature-list">

              <div className="feature-item">
                <div className="feature-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Smart Inventory
                  </strong>

                  <p>
                    Track medicines and stock in real time.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Easy Billing
                  </strong>

                  <p>
                    Create and manage bills quickly.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Powerful Reports
                  </strong>

                  <p>
                    Understand your business with clear reports.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="auth-footer">
            © 2026 MedInventory. All rights reserved.
          </div>

        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="auth-right">

          <div className="login-card">

            <div className="mobile-logo">

              <div className="brand-logo">
                +
              </div>

              <span>
                MedInventory
              </span>

            </div>

            {/* =================================================
                LOGIN HEADING
            ================================================= */}

            <div className="login-heading">

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to continue to your account
              </p>

            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {success && (
              <div className="auth-success">
                <span>✓</span>

                <span>
                  {success}
                </span>
              </div>
            )}

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
              <div className="auth-error">
                <span>!</span>

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}

              <div className="input-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    autoComplete="email"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="input-group">

                <div className="password-label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-button"
                    onClick={handleForgotPassword}
                    disabled={forgotLoading}
                  >
                    {forgotLoading
                      ? "Sending..."
                      : "Forgot password?"}
                  </button>

                </div>

                <div className="input-wrapper">

                  <span className="input-icon">
                    •
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* REMEMBER ME */}

              <div className="remember-row">

                <label className="remember-label">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                  />

                  <span>
                    Remember me
                  </span>

                </label>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-submit"
              >
                Sign in

                <span>
                  →
                </span>
              </button>

            </form>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="divider">
              <span>
                or
              </span>
            </div>

            {/* =================================================
                SIGNUP
            ================================================= */}

            <div className="signup-link">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={onSwitchToSignup}
              >
                Create account
              </button>

            </div>

            {/* =================================================
                SECURITY
            ================================================= */}

            <div className="security-note">
              🔒 Your information is securely protected.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;