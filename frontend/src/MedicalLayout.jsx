import { useEffect, useRef, useState } from "react";
import "./MedicalLayout.css";

function MedicalLayout({
  children,
  currentUser,
  activePage = "inventory",
  onNavigate,
  onLogout,
  onSearch,
  searchValue = "",
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const notificationRef = useRef(null);
  const notificationButtonRef = useRef(null);

  // =====================================================
  // DATE AND TIME
  // =====================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // =====================================================
  // CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!showNotifications) {
        return;
      }

      const notificationPanel = notificationRef.current;
      const notificationButton = notificationButtonRef.current;

      if (
        notificationPanel &&
        notificationButton &&
        !notificationPanel.contains(event.target) &&
        !notificationButton.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showNotifications]);

  // =====================================================
  // USER
  // =====================================================

  const userName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    "Govardhan Vasappagari";

  const userEmail =
    currentUser?.email ||
    "Administrator";

  const avatarLetter =
    userName.charAt(0).toUpperCase();

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const notifications = [
    {
      id: 1,
      icon: "⚠️",
      title: "Low Stock Alert",
      message: "One or more medicines need attention.",
      time: "Just now",
      type: "warning",
    },
    {
      id: 2,
      icon: "📦",
      title: "Inventory Updated",
      message: "Medicine inventory is up to date.",
      time: "5 min ago",
      type: "info",
    },
    {
      id: 3,
      icon: "💊",
      title: "System Ready",
      message: "Medical Inventory System is running.",
      time: "10 min ago",
      type: "success",
    },
  ];

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigate = (page) => {
    setShowNotifications(false);
    setShowProfile(false);

    if (onNavigate) {
      onNavigate(page);
    }
  };

  // =====================================================
  // NOTIFICATION BUTTON
  // =====================================================

  const handleNotificationClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setShowProfile(false);

    setShowNotifications((previous) => !previous);
  };

  // =====================================================
  // DATE
  // =====================================================

  const formattedDate =
    currentDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formattedTime =
    currentDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // =====================================================
  // MENU
  // =====================================================

  const menuItems = [
    {
      id: "inventory",
      label: "Dashboard",
      icon: "▦",
    },
    {
      id: "customers",
      label: "Customers",
      icon: "♙",
    },
    {
      id: "suppliers",
      label: "Suppliers",
      icon: "▣",
    },
    {
      id: "reports",
      label: "Reports",
      icon: "▥",
    },
    {
      id: "billing-history",
      label: "Billing History",
      icon: "▤",
    },
    {
      id: "billing",
      label: "Create Bill",
      icon: "⌁",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "♙",
    },
    {
      id: "add-medicine",
      label: "Add Medicine",
      icon: "+",
    },
  ];

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="medical-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="medical-sidebar">

        {/* LOGO */}

        <div className="medical-logo-area">

          <div className="medical-logo-icon">
            +
          </div>

          <div className="medical-logo-text">

            <h1>
              MedInventory
            </h1>

            <p>
              Medical Inventory System
            </p>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="medical-sidebar-menu">

          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`medical-nav-button ${
                activePage === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() => navigate(item.id)}
            >

              <span className="medical-nav-icon">
                {item.icon}
              </span>

              <span className="medical-nav-text">
                {item.label}
              </span>

            </button>
          ))}

          {/* LOGOUT */}

          <button
            type="button"
            className="medical-nav-button logout"
            onClick={() => {

              setShowNotifications(false);
              setShowProfile(false);

              if (onLogout) {
                onLogout();
              }

            }}
          >

            <span className="medical-nav-icon">
              ⏻
            </span>

            <span className="medical-nav-text">
              Logout
            </span>

          </button>

        </nav>

        {/* SIDEBAR DECORATION */}

        <div className="medical-sidebar-decoration">

          <div className="medical-pulse-line">
            ───╱╲──╱╲────
          </div>

          <div className="medical-decoration-cross">
            +
          </div>

        </div>

        {/* USER */}

        <div
          className="medical-profile"
          onClick={() => {

            setShowNotifications(false);

            setShowProfile(
              (previous) => !previous
            );

          }}
        >

          <div className="medical-profile-avatar">
            {avatarLetter}
          </div>

          <div className="medical-profile-info">

            <p className="medical-profile-name">
              {userName}
            </p>

            <p className="medical-profile-role">
              Administrator
            </p>

            <div className="medical-profile-status">

              <span className="medical-online-dot"></span>

              Online

            </div>

          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="medical-main">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="medical-topbar">

          {/* SEARCH */}

          <div className="medical-global-search">

            <span className="medical-search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search medicine..."
              value={searchValue}
              onChange={(event) => {

                if (onSearch) {
                  onSearch(event.target.value);
                }

              }}
            />

          </div>

          {/* =================================================
              NOTIFICATION BUTTON
          ================================================= */}

          <button
            ref={notificationButtonRef}
            type="button"
            className={`medical-top-icon ${
              showNotifications ? "active" : ""
            }`}
            title="Notifications"
            aria-label="Open notifications"
            aria-expanded={showNotifications}
            onClick={handleNotificationClick}
          >

            <span className="medical-bell-icon">
              🔔
            </span>

            <span className="medical-notification-badge">
              {notifications.length}
            </span>

          </button>

          {/* CALENDAR */}

          <button
            type="button"
            className="medical-top-icon"
            title={`${formattedDate} ${formattedTime}`}
            onClick={() => {

              alert(
                `${formattedDate}\n${formattedTime}`
              );

            }}
          >
            📅
          </button>

          {/* TOP PROFILE */}

          <button
            type="button"
            className="medical-top-profile-button"
            onClick={() => {

              setShowNotifications(false);

              setShowProfile(
                (previous) => !previous
              );

            }}
          >

            {avatarLetter}

          </button>

        </header>

        {/* =================================================
            NOTIFICATION PANEL
        ================================================= */}

        {showNotifications && (

          <div className="medical-notification-container">

            <div
              ref={notificationRef}
              className="medical-notification-panel"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >

              {/* HEADER */}

              <div className="medical-notification-header">

                <div>

                  <h3>
                    Notifications
                  </h3>

                  <p>
                    Stay updated with your system
                  </p>

                </div>

                <span className="medical-notification-count">
                  {notifications.length} new
                </span>

              </div>

              {/* NOTIFICATION LIST */}

              <div className="medical-notification-list">

                {notifications.map(
                  (notification) => (

                    <button
                      key={notification.id}
                      type="button"
                      className={`medical-notification-item ${notification.type}`}
                      onClick={() => {

                        console.log(
                          "Notification clicked:",
                          notification.title
                        );

                        setShowNotifications(false);

                      }}
                    >

                      <span className="medical-notification-icon">
                        {notification.icon}
                      </span>

                      <span className="medical-notification-content">

                        <strong>
                          {notification.title}
                        </strong>

                        <span>
                          {notification.message}
                        </span>

                        <small>
                          {notification.time}
                        </small>

                      </span>

                    </button>

                  )
                )}

              </div>

              {/* FOOTER */}

              <div className="medical-notification-footer">

                <button
                  type="button"
                  onClick={() => {

                    setShowNotifications(false);

                  }}
                >
                  Close Notifications
                </button>

              </div>

            </div>

          </div>

        )}

        {/* =================================================
            PROFILE POPUP
        ================================================= */}

        {showProfile && (

          <div className="medical-profile-popup">

            <div className="medical-profile-popup-top">

              <div className="medical-popup-avatar">
                {avatarLetter}
              </div>

              <div>

                <h3>
                  {userName}
                </h3>

                <p>
                  Administrator
                </p>

              </div>

            </div>

            <div className="medical-profile-popup-info">

              <div className="medical-popup-row">

                <span>
                  Email
                </span>

                <span>
                  {userEmail}
                </span>

              </div>

              <div className="medical-popup-row">

                <span>
                  Status
                </span>

                <span className="online-text">
                  Online
                </span>

              </div>

              <div className="medical-popup-row">

                <span>
                  System
                </span>

                <span>
                  MedInventory
                </span>

              </div>

            </div>

            <button
              type="button"
              className="medical-popup-profile-button"
              onClick={() => navigate("profile")}
            >
              Open Profile
            </button>

            <button
              type="button"
              className="medical-popup-close"
              onClick={() =>
                setShowProfile(false)
              }
            >
              Close
            </button>

          </div>

        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="medical-content">
          {children}
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="medical-footer">

          <span>
            © 2026 MedInventory. All rights reserved.
          </span>

          <span>
            Medical Inventory Management System
          </span>

        </footer>

      </main>

    </div>
  );
}

export default MedicalLayout;