
import { useState } from "react";
import "./Signup.css";

const API_BASE_URL =
  "https://medical-inventory-backend-li17.onrender.com/api/auth";

function Sign({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // SWITCH LOGIN / SIGNUP
  // =====================================================

  const switchMode = () => {
    setIsLogin((previous) => !previous);

    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // =====================================================
  // VALIDATE EMAIL
  // =====================================================

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // =====================================================
  // READ BACKEND ERROR
  // =====================================================

  const getErrorMessage = async (response) => {
    try {
      const contentType =
        response.headers.get("content-type");

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        const data = await response.json();

        return (
          data.message ||
          data.error ||
          "Something went wrong. Please try again."
        );
      }

      const text = await response.text();

      return (
        text ||
        "Something went wrong. Please try again."
      );
    } catch {
      return "Something went wrong. Please try again.";
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async () => {
    const email =
      formData.email.trim().toLowerCase();

    const password = formData.password;

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    if (!isValidEmail(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Sending login request...");

      const response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      console.log(
        "Login response status:",
        response.status
      );

      if (!response.ok) {
        const message =
          await getErrorMessage(response);

        setError(message);
        return;
      }

      const data = await response.json();

      console.log(
        "LOGIN SUCCESS:",
        data
      );

      // =================================================
      // STORE LOGIN STATUS
      // =================================================

      localStorage.setItem(
        "medInventoryLoggedIn",
        "true"
      );

      // =================================================
      // STORE USER
      // =================================================

      const user = {
        id: data.id,
        name: data.name,
        fullName: data.name,
        email: data.email,
      };

      localStorage.setItem(
        "medInventoryUser",
        JSON.stringify(user)
      );

      // =================================================
      // REMEMBER ME
      // =================================================

      if (rememberMe) {
        localStorage.setItem(
          "medInventoryRememberMe",
          "true"
        );
      } else {
        localStorage.removeItem(
          "medInventoryRememberMe"
        );
      }

      setSuccess(
        data.message ||
          "Login successful!"
      );

      // =================================================
      // SEND USER TO APP.JSX
      // =================================================

      if (onAuthSuccess) {
        console.log(
          "Calling onAuthSuccess..."
        );

        onAuthSuccess(user);
      } else {
        console.error(
          "onAuthSuccess function is missing!"
        );
      }
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SIGN UP
  // =====================================================

  const handleSignup = async () => {
    const fullName =
      formData.fullName.trim();

    const email =
      formData.email.trim().toLowerCase();

    const password =
      formData.password;

    const confirmPassword =
      formData.confirmPassword;

    if (!fullName) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (fullName.length < 2) {
      setError(
        "Please enter a valid full name."
      );
      return;
    }

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!isValidEmail(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please create a password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const message =
          await getErrorMessage(response);

        setError(message);
        return;
      }

      const data =
        await response.json();

      setSuccess(
        data.message ||
          "Account created successfully. You can now sign in."
      );

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setIsLogin(true);
        setSuccess("");
      }, 1200);
    } catch (err) {
      console.error(
        "Signup error:",
        err
      );

      setError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const handleForgotPassword = async () => {
    const email =
      formData.email.trim().toLowerCase();

    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Enter your email address first to reset your password."
      );
      return;
    }

    if (!isValidEmail(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let message =
        "Password reset link has been sent. Please check your email.";

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        const data =
          await response.json();

        message =
          data.message || message;
      } else {
        const text =
          await response.text();

        if (text) {
          message = text;
        }
      }

      if (!response.ok) {
        setError(message);
        return;
      }

      setSuccess(message);
    } catch (err) {
      console.error(
        "Forgot password error:",
        err
      );

      setError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (isLogin) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="auth-page">

      {/* =================================================
          LEFT BRAND PANEL
      ================================================= */}

      <section className="auth-brand">

        <div className="brand-top">

          <div className="brand-logo">

            <div className="brand-logo-icon">
              +
            </div>

            <span>
              MedInventory
            </span>

          </div>

        </div>

        <div className="brand-main">

          <div className="brand-badge">
            Medical Inventory Management
          </div>

          <h1>
            Everything you need to
            <span>
              {" "}manage your inventory.
            </span>
          </h1>

          <p>
            Manage medicines, customers,
            suppliers, billing and reports
            in one secure place.
          </p>

          <div className="brand-features">

            <div className="brand-feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Inventory Management
                </strong>

                <p>
                  Track medicines and
                  stock in real time.
                </p>

              </div>

            </div>

            <div className="brand-feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Billing Management
                </strong>

                <p>
                  Create and manage medical
                  bills easily.
                </p>

              </div>

            </div>

            <div className="brand-feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Reports & Analytics
                </strong>

                <p>
                  Get useful insights about
                  your business.
                </p>

              </div>

            </div>

          </div>

        </div>

        <div className="brand-bottom">

          <span>
            © 2026 MedInventory
          </span>

          <span>
            Secure · Reliable · Simple
          </span>

        </div>

      </section>

      {/* =================================================
          RIGHT AUTH PANEL
      ================================================= */}

      <section className="auth-container">

        <div className="auth-card">

          {/* MOBILE LOGO */}

          <div className="mobile-brand">

            <div className="mobile-logo-icon">
              +
            </div>

            <span>
              MedInventory
            </span>

          </div>

          {/* HEADER */}

          <div className="auth-header">

            <h2>
              {isLogin
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p>
              {isLogin
                ? "Sign in to continue to your MedInventory account."
                : "Get started with MedInventory today."}
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="auth-alert auth-error">

              <span className="alert-icon">
                !
              </span>

              <span>
                {error}
              </span>

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="auth-alert auth-success">

              <span className="alert-icon">
                ✓
              </span>

              <span>
                {success}
              </span>

            </div>
          )}

          {/* FORM */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}

            {!isLogin && (
              <div className="form-field">

                <label htmlFor="fullName">
                  Full name
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    👤
                  </span>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="auth-input"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                  />

                </div>

              </div>
            )}

            {/* EMAIL */}

            <div className="form-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="form-field">

              <div className="label-row">

                <label htmlFor="password">
                  Password
                </label>

                {isLogin && (
                  <button
                    type="button"
                    className="forgot-button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                )}

              </div>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className="auth-input password-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete={
                    isLogin
                      ? "current-password"
                      : "new-password"
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

              {!isLogin && (
                <p className="password-hint">
                  Use at least 6 characters.
                </p>
              )}

            </div>

            {/* CONFIRM PASSWORD */}

            {!isLogin && (
              <div className="form-field">

                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔒
                  </span>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    className="auth-input password-input"
                    placeholder="Confirm your password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>
            )}

            {/* REMEMBER ME */}

            {isLogin && (
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
            )}

            {/* TERMS */}

            {!isLogin && (
              <div className="terms-row">

                <input
                  id="terms"
                  type="checkbox"
                  required
                />

                <label htmlFor="terms">

                  I agree to{" "}

                  <button
                    type="button"
                    className="terms-link"
                    onClick={() =>
                      alert(
                        "Terms & Conditions will be available here."
                      )
                    }
                  >
                    Terms & Conditions
                  </button>

                </label>

              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="auth-spinner"></span>

                  {isLogin
                    ? "Signing in..."
                    : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin
                    ? "Sign in"
                    : "Create account"}

                  <span className="submit-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* DIVIDER */}

          <div className="auth-divider">

            <span></span>

            <p>
              or
            </p>

            <span></span>

          </div>

          {/* GOOGLE */}

          <div className="social-login">

            <button
              type="button"
              className="social-button"
              onClick={() =>
                setError(
                  "Google sign in will be connected when authentication is added."
                )
              }
            >

              <strong>
                G
              </strong>

              Continue with Google

            </button>

          </div>

          {/* SWITCH */}

          <div className="auth-switch">

            <span>
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              onClick={switchMode}
            >
              {isLogin
                ? "Create account"
                : "Sign in"}
            </button>

          </div>

          {/* SECURITY */}

          <div className="security-message">

            <span className="security-icon">
              🔒
            </span>

            <span>
              Your account information is
              securely protected.
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Sign;

