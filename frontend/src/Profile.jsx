import { useState } from "react";
import "./Profile.css";

function Profile({
  currentUser,
  stats = {},
  onBack,
  onNavigate,
}) {
  // =====================================================
  // SAVED PREFERENCES
  // =====================================================

  const savedPreferences = JSON.parse(
    localStorage.getItem("medInventoryPreferences") || "{}"
  );

  // =====================================================
  // USER NAME
  // =====================================================

  const getUserName = () => {
    return currentUser?.name || currentUser?.fullName || "User";
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profile, setProfile] = useState({
    name: getUserName(),
    email: currentUser?.email || "",
  });

  const [isEditing, setIsEditing] = useState(false);

  // =====================================================
  // NOTIFICATION STATE
  // =====================================================

  const [notifications, setNotifications] = useState({
    lowStock: savedPreferences.lowStock !== false,
    expiry: savedPreferences.expiry !== false,
    billing: savedPreferences.billing !== false,
    security: savedPreferences.security !== false,
  });

  // =====================================================
  // MESSAGE
  // =====================================================

  const [message, setMessage] = useState("");

  // =====================================================
  // CHANGE PASSWORD STATE
  // =====================================================

  const [showChangePassword, setShowChangePassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  // =====================================================
  // FEATURE NAVIGATION
  // =====================================================

  const handleFeatureNavigation = (page) => {
    if (typeof onNavigate === "function") {
      onNavigate(page);
    }
  };

  // =====================================================
  // HANDLE PROFILE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSaveProfile = () => {
    if (!profile.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: profile.name.trim(),
      fullName: profile.name.trim(),
      email: profile.email,
    };

    localStorage.setItem(
      "medInventoryUser",
      JSON.stringify(updatedUser)
    );

    setProfile({
      name: profile.name.trim(),
      email: profile.email,
    });

    setIsEditing(false);
    setMessage("Profile updated successfully.");

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  // =====================================================
  // CANCEL PROFILE EDIT
  // =====================================================

  const handleCancelEdit = () => {
    setProfile({
      name: getUserName(),
      email: currentUser?.email || "",
    });

    setIsEditing(false);
    setMessage("");
  };

  // =====================================================
  // NOTIFICATION SETTINGS
  // =====================================================

  const handleNotificationChange = (name) => {
    setNotifications((previous) => {
      const updated = {
        ...previous,
        [name]: !previous[name],
      };

      localStorage.setItem(
        "medInventoryPreferences",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  // =====================================================
  // OPEN CHANGE PASSWORD
  // =====================================================

  const handlePasswordReset = () => {
    setShowChangePassword(true);
    setMessage("");
  };

  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  const getPasswordStrength = () => {
    if (!newPassword) {
      return {
        text: "Enter password",
        className: "empty",
      };
    }

    let score = 0;

    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 10) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) {
      return {
        text: "Weak",
        className: "weak",
      };
    }

    if (score <= 3) {
      return {
        text: "Medium",
        className: "medium",
      };
    }

    return {
      text: "Strong",
      className: "strong",
    };
  };

  const passwordStrength = getPasswordStrength();

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setMessage("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setMessage("Please enter your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setMessage("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(
        "New password and confirm password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setMessage(
        "New password must be different from your current password."
      );
      return;
    }

    if (!profile.email) {
      setMessage(
        "No email address is available for this account."
      );
      return;
    }

    try {
      setIsChangingPassword(true);
      setMessage("");

      const response = await fetch(
        "https://medical-inventory-backend-li17.onrender.com/api/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: profile.email,
            currentPassword,
            newPassword,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to change password."
        );
      }

      setMessage(
        data.message || "Password updated successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setShowChangePassword(false);
    } catch (error) {
      console.error("Change password error:", error);

      setMessage(
        error.message ||
          "Unable to change password. Make sure Spring Boot is running."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // =====================================================
  // CANCEL CHANGE PASSWORD
  // =====================================================

  const handleCancelChangePassword = () => {
    setShowChangePassword(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setMessage("");
  };

  // =====================================================
  // USER DATA
  // =====================================================

  const userName = profile.name || "User";

  const initials = getInitials(userName);

  const accountId = currentUser?.id || "Not available";

  // =====================================================
  // FEATURE DATA
  // =====================================================

  const features = [
    {
      id: "medicine",
      icon: "💊",
      title: "Medicine Management",
      description:
        "Track medicines, batches, manufacturers, pricing and stock levels.",
      action: () => handleFeatureNavigation("inventory"),
    },

    {
      id: "expiry",
      icon: "⏰",
      title: "Expiry Monitoring",
      description:
        "Monitor medicines approaching expiry and reduce inventory waste.",
      action: () => handleFeatureNavigation("inventory"),
    },

    {
      id: "stock",
      icon: "📦",
      title: "Smart Stock Alerts",
      description:
        "Identify low-stock and out-of-stock medicines quickly.",
      action: () => handleFeatureNavigation("inventory"),
    },

    {
      id: "billing",
      icon: "🧾",
      title: "Digital Billing",
      description:
        "Generate and manage medical invoices from one workspace.",
      action: () => handleFeatureNavigation("billing"),
    },

    {
      id: "analytics",
      icon: "📈",
      title: "Business Analytics",
      description:
        "Monitor sales, revenue, billing activity and medicine performance.",
      action: () => handleFeatureNavigation("reports"),
    },

    {
      id: "suppliers",
      icon: "🚚",
      title: "Supplier Management",
      description:
        "Organize supplier information and support better inventory replenishment.",
      action: () => handleFeatureNavigation("suppliers"),
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="profile-page">

      {/* HEADER */}

      <div className="profile-header">
        <div>
          <h1>👤 My Profile</h1>

          <p>
            Manage your account and MedInventory preferences
          </p>
        </div>

        <button
          type="button"
          className="profile-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* MESSAGE */}

      {message && (
        <div className="profile-message">
          ✓ {message}
        </div>
      )}

      {/* PROFILE HERO */}

      <section className="profile-hero">

        <div className="profile-avatar">
          {initials}
        </div>

        <div className="profile-hero-info">

          <h2>{userName}</h2>

          <p>
            {profile.email || "Email not available"}
          </p>

          <span className="profile-status">
            <span className="status-dot"></span>
            Active Account
          </span>

        </div>

        <div className="profile-hero-actions">

          {!isEditing ? (
            <button
              type="button"
              className="edit-profile-button"
              onClick={() => {
                setIsEditing(true);
                setMessage("");
              }}
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <div className="edit-actions">

              <button
                type="button"
                className="save-profile-button"
                onClick={handleSaveProfile}
              >
                ✓ Save
              </button>

              <button
                type="button"
                className="cancel-profile-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>

            </div>
          )}

        </div>

      </section>

      {/* QUICK FEATURE CENTER */}

      <section className="profile-card profile-feature-center">

        <div className="profile-card-header">

          <div>
            <h2>🏥 MedInventory Features</h2>

            <p>
              Quickly access the tools you use to manage your
              medical inventory.
            </p>
          </div>

          <span className="card-icon">
            ⚡
          </span>

        </div>

        <div className="feature-grid">

          {features.map((feature) => (
            <button
              key={feature.id}
              type="button"
              className="feature-card"
              onClick={feature.action}
            >

              <div className="feature-card-icon">
                {feature.icon}
              </div>

              <div className="feature-card-content">

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

                <span className="feature-card-action">
                  Open Feature →
                </span>

              </div>

            </button>
          ))}

        </div>

      </section>

      {/* PERSONAL INFORMATION + SECURITY */}

      <div className="profile-main-grid">

        {/* PERSONAL INFORMATION */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div>
              <h2>👤 Personal Information</h2>
              <p>Your account details</p>
            </div>

            <span className="card-icon">
              📝
            </span>

          </div>

          <div className="profile-form">

            <div className="profile-field">

              <label>Full Name</label>

              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="profile-value">
                  {profile.name || "Not provided"}
                </div>
              )}

            </div>

            <div className="profile-field">

              <label>Email Address</label>

              <div className="profile-value">
                {profile.email || "Not provided"}
              </div>

              <small>
                Email address is linked to your account.
              </small>

            </div>

            <div className="profile-field">

              <label>Account ID</label>

              <div className="profile-value">
                #{accountId}
              </div>

            </div>

          </div>

        </section>

        {/* SECURITY */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div>
              <h2>🔐 Security</h2>
              <p>Keep your account protected</p>
            </div>

            <span className="card-icon">
              🛡️
            </span>

          </div>

          <div className="security-list">

            {/* PASSWORD */}

            <div className="security-item">

              <div className="security-item-icon">
                🔒
              </div>

              <div className="security-item-content">

                <strong>Password</strong>

                <span>
                  Your password is securely encrypted.
                </span>

              </div>

              <button
                type="button"
                className="security-button"
                onClick={handlePasswordReset}
              >
                Reset
              </button>

            </div>

            {/* CHANGE PASSWORD */}

            {showChangePassword && (
              <div className="change-password-panel">

                <div className="change-password-header">

                  <div>
                    <h3>
                      🔐 Change Password
                    </h3>

                    <p>
                      Update your MedInventory account password
                    </p>
                  </div>

                  <button
                    type="button"
                    className="change-password-close"
                    onClick={handleCancelChangePassword}
                    aria-label="Close"
                  >
                    ×
                  </button>

                </div>

                {/* CURRENT PASSWORD */}

                <div className="change-password-field">

                  <label>
                    Current Password
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      placeholder="Enter current password"
                    />

                    <button
                      type="button"
                      className="password-eye-button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (previous) => !previous
                        )
                      }
                    >
                      {showCurrentPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                </div>

                {/* NEW PASSWORD */}

                <div className="change-password-field">

                  <label>
                    New Password
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="Enter new password"
                    />

                    <button
                      type="button"
                      className="password-eye-button"
                      onClick={() =>
                        setShowNewPassword(
                          (previous) => !previous
                        )
                      }
                    >
                      {showNewPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                  <div className="password-strength">

                    <span>
                      Password strength:
                    </span>

                    <strong
                      className={
                        passwordStrength.className
                      }
                    >
                      {passwordStrength.text}
                    </strong>

                  </div>

                  <div className="password-strength-bar">

                    <span
                      className={
                        passwordStrength.className
                      }
                    ></span>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}

                <div className="change-password-field">

                  <label>
                    Confirm New Password
                  </label>

                  <div className="password-input-wrapper">

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm new password"
                    />

                    <button
                      type="button"
                      className="password-eye-button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                    >
                      {showConfirmPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                  {confirmPassword &&
                    newPassword !== confirmPassword && (
                      <small className="password-error">
                        Passwords do not match.
                      </small>
                    )}

                  {confirmPassword &&
                    newPassword === confirmPassword && (
                      <small className="password-success">
                        ✓ Passwords match.
                      </small>
                    )}

                </div>

                {/* PASSWORD ACTIONS */}

                <div className="change-password-actions">

                  <button
                    type="button"
                    className="change-password-cancel"
                    onClick={handleCancelChangePassword}
                    disabled={isChangingPassword}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="change-password-update"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword
                      ? "Updating..."
                      : "Update Password"}
                  </button>

                </div>

              </div>
            )}

            {/* ACCOUNT PROTECTION */}

            <div className="security-item">

              <div className="security-item-icon green">
                ✓
              </div>

              <div className="security-item-content">

                <strong>
                  Account Protection
                </strong>

                <span>
                  Your account is currently active.
                </span>

              </div>

              <span className="verified-badge">
                Protected
              </span>

            </div>

            {/* CURRENT SESSION */}

            <div className="security-item">

              <div className="security-item-icon blue">
                🌐
              </div>

              <div className="security-item-content">

                <strong>
                  Current Session
                </strong>

                <span>
                  MedInventory Web Application
                </span>

              </div>

              <span className="session-badge">
                Active
              </span>

            </div>

          </div>

        </section>

      </div>

      {/* MEDICAL INVENTORY OVERVIEW */}

      <section className="profile-card medical-overview">

        <div className="profile-card-header">

          <div>
            <h2>
              💊 Medical Inventory Overview
            </h2>

            <p>
              Your current workspace statistics
            </p>
          </div>

          <span className="card-icon">
            📊
          </span>

        </div>

        <div className="profile-stat-grid">

          <button
            type="button"
            className="profile-stat-card blue"
            onClick={() =>
              handleFeatureNavigation("inventory")
            }
          >
            <span>💊</span>

            <strong>
              {stats.totalMedicines || 0}
            </strong>

            <small>
              Total Medicines
            </small>
          </button>

          <button
            type="button"
            className="profile-stat-card orange"
            onClick={() =>
              handleFeatureNavigation("inventory")
            }
          >
            <span>⚠️</span>

            <strong>
              {stats.lowStock || 0}
            </strong>

            <small>
              Low Stock
            </small>
          </button>

          <button
            type="button"
            className="profile-stat-card red"
            onClick={() =>
              handleFeatureNavigation("inventory")
            }
          >
            <span>⏰</span>

            <strong>
              {stats.expiringSoon || 0}
            </strong>

            <small>
              Expiring Soon
            </small>
          </button>

          <button
            type="button"
            className="profile-stat-card green"
            onClick={() =>
              handleFeatureNavigation("history")
            }
          >
            <span>🧾</span>

            <strong>
              {stats.totalBills || 0}
            </strong>

            <small>
              Total Bills
            </small>
          </button>

        </div>

      </section>

      {/* NOTIFICATION PREFERENCES */}

      <section className="profile-card">

        <div className="profile-card-header">

          <div>
            <h2>
              🔔 Notification Preferences
            </h2>

            <p>
              Choose which MedInventory alerts you want
            </p>
          </div>

          <span className="card-icon">
            🔔
          </span>

        </div>

        <div className="notification-list">

          {/* LOW STOCK */}

          <div className="notification-item">

            <div className="notification-icon orange">
              📦
            </div>

            <div className="notification-content">

              <strong>
                Low Stock Alerts
              </strong>

              <span>
                Get notified when medicine stock becomes low.
              </span>

            </div>

            <button
              type="button"
              className={`toggle ${
                notifications.lowStock
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNotificationChange("lowStock")
              }
            >
              <span></span>
            </button>

          </div>

          {/* EXPIRY */}

          <div className="notification-item">

            <div className="notification-icon red">
              ⏰
            </div>

            <div className="notification-content">

              <strong>
                Medicine Expiry Alerts
              </strong>

              <span>
                Receive alerts for medicines approaching expiry.
              </span>

            </div>

            <button
              type="button"
              className={`toggle ${
                notifications.expiry
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNotificationChange("expiry")
              }
            >
              <span></span>
            </button>

          </div>

          {/* BILLING */}

          <div className="notification-item">

            <div className="notification-icon blue">
              🧾
            </div>

            <div className="notification-content">

              <strong>
                Billing Notifications
              </strong>

              <span>
                Stay informed about billing activity and invoices.
              </span>

            </div>

            <button
              type="button"
              className={`toggle ${
                notifications.billing
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNotificationChange("billing")
              }
            >
              <span></span>
            </button>

          </div>

          {/* SECURITY */}

          <div className="notification-item">

            <div className="notification-icon green">
              🛡️
            </div>

            <div className="notification-content">

              <strong>
                Security Notifications
              </strong>

              <span>
                Receive important account security updates.
              </span>

            </div>

            <button
              type="button"
              className={`toggle ${
                notifications.security
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleNotificationChange("security")
              }
            >
              <span></span>
            </button>

          </div>

        </div>

      </section>

      {/* FEATURE INFORMATION */}

      <section className="profile-card">

        <div className="profile-card-header">

          <div>
            <h2>
              🏥 MedInventory Workspace
            </h2>

            <p>
              Everything you need to operate your medical inventory.
            </p>
          </div>

          <span className="card-icon">
            🏥
          </span>

        </div>

        <div className="feature-grid">

          {/* MEDICINE */}

          <button
            type="button"
            className="feature-card"
            onClick={() =>
              handleFeatureNavigation("inventory")
            }
          >
            <div className="feature-card-icon">
              💊
            </div>

            <div className="feature-card-content">

              <h3>
                Medicine Management
              </h3>

              <p>
                Add, edit, search and remove medicines
                while monitoring stock.
              </p>

              <span className="feature-card-action">
                Manage Medicines →
              </span>

            </div>
          </button>

          {/* EXPIRY */}

          <button
            type="button"
            className="feature-card"
            onClick={() =>
              handleFeatureNavigation("inventory")
            }
          >
            <div className="feature-card-icon">
              ⏰
            </div>

            <div className="feature-card-content">

              <h3>
                Expiry Monitoring
              </h3>

              <p>
                Review medicines that are expired or
                approaching expiry.
              </p>

              <span className="feature-card-action">
                Check Expiry →
              </span>

            </div>
          </button>

          {/* STOCK */}

          <button
            type="button"
            className="feature-card"
            onClick={() =>
              handleFeatureNavigation("inventory")
            }
          >
            <div className="feature-card-icon">
              📦
            </div>

            <div className="feature-card-content">

              <h3>
                Smart Stock Alerts
              </h3>

              <p>
                Identify medicines that need immediate
                restocking attention.
              </p>

              <span className="feature-card-action">
                Check Stock →
              </span>

            </div>
          </button>

          {/* BILLING */}

          <button
            type="button"
            className="feature-card"
            onClick={() =>
              handleFeatureNavigation("billing")
            }
          >
            <div className="feature-card-icon">
              🧾
            </div>

            <div className="feature-card-content">

              <h3>
                Digital Billing
              </h3>

              <p>
                Create customer bills and generate
                invoice PDFs.
              </p>

              <span className="feature-card-action">
                Create Bill →
              </span>

            </div>
          </button>

          {/* REPORTS */}

          <button
            type="button"
            className="feature-card"
            onClick={() =>
              handleFeatureNavigation("reports")
            }
          >
            <div className="feature-card-icon">
              📈
            </div>

            <div className="feature-card-content">

              <h3>
                Business Analytics
              </h3>

              <p>
                Review inventory, billing and business
                performance reports.
              </p>

              <span className="feature-card-action">
                View Reports →
              </span>

            </div>
          </button>

          {/* SUPPLIERS */}

          <button
            type="button"
            className="feature-card"
            onClick={() =>
              handleFeatureNavigation("suppliers")
            }
          >
            <div className="feature-card-icon">
              🚚
            </div>

            <div className="feature-card-content">

              <h3>
                Supplier Management
              </h3>

              <p>
                Manage suppliers and support inventory
                replenishment.
              </p>

              <span className="feature-card-action">
                Manage Suppliers →
              </span>

            </div>
          </button>

        </div>

      </section>

      {/* ACCOUNT INFORMATION */}

      <section className="profile-card account-summary">

        <div className="account-summary-icon">
          🛡️
        </div>

        <div className="account-summary-content">

          <h3>
            Your account is protected
          </h3>

          <p>
            MedInventory keeps your account information
            protected while giving you control over your
            inventory and medical operations.
          </p>

        </div>

        <div className="account-summary-status">

          <span></span>

          Secure

        </div>

      </section>

      {/* FOOTER */}

      <div className="profile-footer">

        <span>
          © 2026 MedInventory
        </span>

        <span>
          Secure · Reliable · Medical Inventory Management
        </span>

      </div>

    </div>
  );
}

export default Profile;
