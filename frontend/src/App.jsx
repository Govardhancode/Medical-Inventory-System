import { useEffect, useRef, useState } from "react";
import "./App.css";

import Sign from "./Sign";
import Billing from "./Billing";
import BillingHistory from "./BillingHistory";
import CustomerManagement from "./CustomerManagement";
import Reports from "./components/Reports";
import SupplierManagement from "./components/SupplierManagement";
import Profile from "./Profile";
import AIChatbox from "./AIChatbox";

const API_URL = "http://localhost:8080/api";

function App() {
  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("medInventoryLoggedIn") === "true"
  );

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("medInventoryUser");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // =====================================================
  // MEDICINES
  // =====================================================

  const [medicines, setMedicines] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // NAVIGATION
  // =====================================================

  const [activePage, setActivePage] = useState("inventory");

  // =====================================================
  // MEDICINE FORM
  // =====================================================

  const [showForm, setShowForm] = useState(false);

  const [editingMedicine, setEditingMedicine] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    batchNumber: "",
    manufacturer: "",
    expiryDate: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
  });

  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");

  // =====================================================
  // BILL COUNT
  // =====================================================

  const [totalBills, setTotalBills] = useState(0);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notificationOpen, setNotificationOpen] = useState(false);

  const notificationRef = useRef(null);

  // =====================================================
  // LOGIN SUCCESS
  // =====================================================

  const handleAuthSuccess = (user) => {
    setIsLoggedIn(true);

    setCurrentUser(user);

    localStorage.setItem(
      "medInventoryLoggedIn",
      "true"
    );

    localStorage.setItem(
      "medInventoryUser",
      JSON.stringify(user)
    );

    setActivePage("inventory");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "medInventoryLoggedIn"
    );

    localStorage.removeItem(
      "medInventoryUser"
    );

    setIsLoggedIn(false);

    setCurrentUser(null);

    setActivePage("inventory");

    setShowForm(false);

    setNotificationOpen(false);
  };

  // =====================================================
  // FETCH MEDICINES
  // =====================================================

  const fetchMedicines = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_URL}/medicines`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch medicines"
        );
      }

      const data = await response.json();

      setMedicines(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Fetch medicines error:",
        err
      );

      setError(
        "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (isLoggedIn) {
      fetchMedicines();
    }
  }, [isLoggedIn]);

  // =====================================================
  // FETCH BILL COUNT
  // =====================================================

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const fetchBillCount = async () => {
      try {
        const response = await fetch(
          `${API_URL}/bills`
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setTotalBills(data.length);
        }
      } catch (err) {
        console.error(
          "Fetch bill count error:",
          err
        );
      }
    };

    fetchBillCount();
  }, [isLoggedIn]);

  // =====================================================
  // CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =====================================================
  // FORM INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      })
    );
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      batchNumber: "",
      manufacturer: "",
      expiryDate: "",
      purchasePrice: "",
      sellingPrice: "",
      quantity: "",
    });

    setEditingMedicine(null);
  };

  // =====================================================
  // ADD MEDICINE
  // =====================================================

  const openAddForm = () => {
    setActivePage("inventory");

    resetForm();

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // EDIT MEDICINE
  // =====================================================

  const openEditForm = (medicine) => {
    setActivePage("inventory");

    setEditingMedicine(medicine);

    setFormData({
      name:
        medicine.name || "",

      category:
        medicine.category || "",

      batchNumber:
        medicine.batchNumber || "",

      manufacturer:
        medicine.manufacturer || "",

      expiryDate:
        medicine.expiryDate || "",

      purchasePrice:
        medicine.purchasePrice ?? "",

      sellingPrice:
        medicine.sellingPrice ?? "",

      quantity:
        medicine.quantity ?? "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    setShowForm(false);

    resetForm();
  };

  // =====================================================
  // ADD / UPDATE MEDICINE
  // =====================================================

  const handleMedicineSubmit = async (e) => {
    e.preventDefault();

    try {
      const medicine = {
        name:
          formData.name.trim(),

        category:
          formData.category.trim(),

        batchNumber:
          formData.batchNumber.trim(),

        manufacturer:
          formData.manufacturer.trim(),

        expiryDate:
          formData.expiryDate,

        purchasePrice:
          Number(
            formData.purchasePrice
          ),

        sellingPrice:
          Number(
            formData.sellingPrice
          ),

        quantity:
          Number(
            formData.quantity
          ),
      };

      let response;

      if (editingMedicine) {
        response = await fetch(
          `${API_URL}/medicines/${editingMedicine.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                medicine
              ),
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/medicines`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                medicine
              ),
          }
        );
      }

      if (!response.ok) {
        const errorMessage =
          await response.text();

        throw new Error(
          errorMessage ||
            "Failed to save medicine"
        );
      }

      alert(
        editingMedicine
          ? "Medicine updated successfully!"
          : "Medicine added successfully!"
      );

      closeForm();

      await fetchMedicines();
    } catch (err) {
      console.error(
        "Save medicine error:",
        err
      );

      alert(
        err.message ||
          "Failed to save medicine"
      );
    }
  };

  // =====================================================
  // DELETE MEDICINE
  // =====================================================

  const deleteMedicine = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this medicine?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/medicines/${id}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Failed to delete medicine"
        );
      }

      alert(
        "Medicine deleted successfully!"
      );

      await fetchMedicines();
    } catch (err) {
      console.error(
        "Delete medicine error:",
        err
      );

      alert(
        "Cannot delete this medicine because it may already be used in a bill."
      );
    }
  };

  // =====================================================
  // DASHBOARD CALCULATIONS
  // =====================================================

  const totalStock =
    medicines.reduce(
      (sum, medicine) =>
        sum +
        Number(
          medicine.quantity || 0
        ),
      0
    );

  const lowStock =
    medicines.filter(
      (medicine) =>
        Number(
          medicine.quantity || 0
        ) > 0 &&
        Number(
          medicine.quantity || 0
        ) <= 10
    );

  const outOfStock =
    medicines.filter(
      (medicine) =>
        Number(
          medicine.quantity || 0
        ) <= 0
    );

  const expiringSoon =
    medicines.filter(
      (medicine) => {
        if (!medicine.expiryDate) {
          return false;
        }

        const today =
          new Date();

        const expiry =
          new Date(
            medicine.expiryDate
          );

        const difference =
          (expiry - today) /
          (1000 *
            60 *
            60 *
            24);

        return (
          difference >= 0 &&
          difference <= 90
        );
      }
    );

  const expiredMedicines =
    medicines.filter(
      (medicine) => {
        if (!medicine.expiryDate) {
          return false;
        }

        const today =
          new Date();

        const expiry =
          new Date(
            medicine.expiryDate
          );

        return expiry < today;
      }
    );

  // =====================================================
  // NOTIFICATION DATA
  // =====================================================

  const notifications = [];

  // OUT OF STOCK NOTIFICATIONS

  outOfStock.forEach(
    (medicine) => {
      notifications.push({
        id:
          `out-${medicine.id}`,

        type: "danger",

        icon: "🚨",

        title:
          "Medicine Out of Stock",

        message:
          `${medicine.name} is currently out of stock.`,

        priority: 1,
      });
    }
  );

  // LOW STOCK NOTIFICATIONS

  lowStock.forEach(
    (medicine) => {
      notifications.push({
        id:
          `low-${medicine.id}`,

        type: "warning",

        icon: "⚠️",

        title:
          "Low Stock Alert",

        message:
          `${medicine.name} has only ${medicine.quantity} units remaining.`,

        priority: 2,
      });
    }
  );

  // EXPIRED MEDICINE NOTIFICATIONS

  expiredMedicines.forEach(
    (medicine) => {
      notifications.push({
        id:
          `expired-${medicine.id}`,

        type: "danger",

        icon: "❌",

        title:
          "Medicine Expired",

        message:
          `${medicine.name} expired on ${medicine.expiryDate}.`,

        priority: 1,
      });
    }
  );

  // EXPIRING SOON NOTIFICATIONS

  expiringSoon.forEach(
    (medicine) => {
      notifications.push({
        id:
          `expiry-${medicine.id}`,

        type: "expiry",

        icon: "⏰",

        title:
          "Expiry Warning",

        message:
          `${medicine.name} will expire soon on ${medicine.expiryDate}.`,

        priority: 3,
      });
    }
  );

  notifications.sort(
    (a, b) =>
      a.priority - b.priority
  );

  const notificationCount =
    notifications.length;

  // =====================================================
  // NOTIFICATION CLICK
  // =====================================================

  const handleNotificationClick = () => {
    setNotificationOpen(
      (previous) => !previous
    );
  };

  // =====================================================
  // OPEN INVENTORY FROM NOTIFICATION
  // =====================================================

  const handleNotificationItemClick =
    () => {
      setNotificationOpen(false);

      setActivePage("inventory");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredMedicines =
    medicines.filter(
      (medicine) => {
        const searchText =
          search
            .toLowerCase()
            .trim();

        return (
          medicine.name
            ?.toLowerCase()
            .includes(
              searchText
            ) ||
          medicine.category
            ?.toLowerCase()
            .includes(
              searchText
            ) ||
          medicine.batchNumber
            ?.toLowerCase()
            .includes(
              searchText
            ) ||
          medicine.manufacturer
            ?.toLowerCase()
            .includes(
              searchText
            )
        );
      }
    );

  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigateTo = (page) => {
    setShowForm(false);

    setNotificationOpen(false);

    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleProfileNavigation =
    (page) => {
      setShowForm(false);

      setNotificationOpen(false);

      setActivePage(page);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!isLoggedIn) {
    return (
      <Sign
        onAuthSuccess={
          handleAuthSuccess
        }
      />
    );
  }

  // =====================================================
  // SIDEBAR MENU
  // =====================================================

  const menuItems = [
    {
      id: "inventory",
      icon: "▦",
      label: "Dashboard",
    },

    {
      id: "customers",
      icon: "♙",
      label: "Customers",
    },

    {
      id: "suppliers",
      icon: "▣",
      label: "Suppliers",
    },

    {
      id: "reports",
      icon: "▥",
      label: "Reports",
    },

    {
      id: "history",
      icon: "▤",
      label: "Billing History",
    },

    {
      id: "billing",
      icon: "✎",
      label: "Create Bill",
    },

    {
      id: "profile",
      icon: "♙",
      label: "Profile",
    },
  ];

  // =====================================================
  // PAGE CONTENT
  // =====================================================

  const renderPage = () => {
    if (
      activePage ===
      "customers"
    ) {
      return (
        <CustomerManagement
          onBack={() =>
            navigateTo(
              "inventory"
            )
          }
        />
      );
    }

    if (
      activePage ===
      "suppliers"
    ) {
      return (
        <SupplierManagement
          onBack={() =>
            navigateTo(
              "inventory"
            )
          }
        />
      );
    }

    if (
      activePage ===
      "reports"
    ) {
      return (
        <Reports
          onBack={() =>
            navigateTo(
              "inventory"
            )
          }
        />
      );
    }

    if (
      activePage ===
      "history"
    ) {
      return (
        <BillingHistory
          onBack={() =>
            navigateTo(
              "inventory"
            )
          }
        />
      );
    }

    if (
      activePage ===
      "billing"
    ) {
      return (
        <Billing
          onBack={() =>
            navigateTo(
              "inventory"
            )
          }
        />
      );
    }

    if (
      activePage ===
      "profile"
    ) {
      return (
        <Profile
          currentUser={
            currentUser
          }

          stats={{
            totalMedicines:
              medicines.length,

            lowStock:
              lowStock.length,

            expiringSoon:
              expiringSoon.length,

            totalBills:
              totalBills,
          }}

          onBack={() =>
            navigateTo(
              "inventory"
            )
          }

          onNavigate={
            handleProfileNavigation
          }
        />
      );
    }

    return null;
  };

  // =====================================================
  // MAIN APPLICATION
  // =====================================================

  return (
    <div className="medical-app">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="logo-icon">
            +
          </div>

          <div>
            <h1>
              MedInventory
            </h1>

            <p>
              Medical Inventory System
            </p>
          </div>

        </div>

        <nav className="sidebar-menu">

          {menuItems.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                className={
                  activePage ===
                  item.id
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                onClick={() =>
                  navigateTo(
                    item.id
                  )
                }
              >

                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

              </button>
            )
          )}

          <button
            type="button"
            className="sidebar-item"
            onClick={
              openAddForm
            }
          >

            <span className="sidebar-icon">
              +
            </span>

            <span>
              Add Medicine
            </span>

          </button>

          <button
            type="button"
            className="sidebar-item logout-sidebar"
            onClick={
              handleLogout
            }
          >

            <span className="sidebar-icon">
              ⏻
            </span>

            <span>
              Logout
            </span>

          </button>

        </nav>

        <div className="medical-decoration">

          <div className="heartbeat">
            ───╱╲──╱╲────
          </div>

          <div className="medical-cross">
            +
          </div>

          <div className="medical-circle">
            ◉
          </div>

        </div>

        <div className="sidebar-user">

          <div className="user-avatar">

            {(
              currentUser?.name ||
              currentUser?.fullName ||
              "G"
            )
              .charAt(0)
              .toUpperCase()}

          </div>

          <div className="user-details">

            <strong>
              {currentUser?.name ||
                currentUser?.fullName ||
                "Gova"}
            </strong>

            <span>
              Administrator
            </span>

            <small>
              <i></i>
              Online
            </small>

          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <div className="main-area">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="topbar">

          <div className="topbar-search">

            <span>
              🔍
            </span>

            <input
              type="text"
              placeholder="Search medicine..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="topbar-icons">

            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <div
              className="notification-wrapper"
              ref={notificationRef}
            >

              <button
                type="button"
                className="notification-button"
                onClick={
                  handleNotificationClick
                }
                title="Notifications"
                aria-label="Notifications"
              >

                <span className="notification-bell">
                  🔔
                </span>

                {notificationCount >
                  0 && (
                  <span className="notification-count">
                    {notificationCount >
                    99
                      ? "99+"
                      : notificationCount}
                  </span>
                )}

              </button>

              {notificationOpen && (
                <div className="notification-dropdown">

                  <div className="notification-header">

                    <div>
                      <h3>
                        Notifications
                      </h3>

                      <span>
                        {notificationCount ===
                        0
                          ? "You're all caught up"
                          : `${notificationCount} notification${
                              notificationCount ===
                              1
                                ? ""
                                : "s"
                            }`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setNotificationOpen(
                          false
                        )
                      }
                      aria-label="Close notifications"
                    >
                      ✕
                    </button>

                  </div>

                  <div className="notification-list">

                    {notifications.length ===
                    0 ? (
                      <div className="no-notifications">

                        <div>
                          🎉
                        </div>

                        <strong>
                          No new notifications
                        </strong>

                        <p>
                          Your inventory looks good.
                        </p>

                      </div>
                    ) : (
                      notifications.map(
                        (
                          notification
                        ) => (
                          <button
                            type="button"
                            className={`notification-item ${notification.type}`}
                            key={
                              notification.id
                            }
                            onClick={
                              handleNotificationItemClick
                            }
                          >

                            <div className="notification-item-icon">
                              {
                                notification.icon
                              }
                            </div>

                            <div className="notification-item-content">

                              <strong>
                                {
                                  notification.title
                                }
                              </strong>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                            </div>

                          </button>
                        )
                      )
                    )}

                  </div>

                  {notifications.length >
                    0 && (
                    <button
                      type="button"
                      className="notification-footer"
                      onClick={
                        handleNotificationItemClick
                      }
                    >
                      View inventory
                    </button>
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                PROFILE BUTTON
            ================================================= */}

            <button
              type="button"
              className="topbar-profile-button"
              onClick={() =>
                navigateTo(
                  "profile"
                )
              }
              title="My Profile"
              aria-label="My Profile"
            >
              👤
            </button>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="page-content">

          {activePage ===
          "inventory" ? (
            <>

              {/* =================================================
                  WELCOME
              ================================================= */}

              <div className="welcome-section">

                <div>

                  <h2>
                    Welcome back,{" "}

                    <span>
                      {currentUser?.name ||
                        currentUser?.fullName ||
                        "Gova"}{" "}
                      👋
                    </span>
                  </h2>

                  <p>
                    Here's what's happening
                    with your inventory today.
                  </p>

                </div>

                <div className="date-card">

                  <span>
                    📅
                  </span>

                  <div>

                    <strong>
                      {new Date().toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </strong>

                    <small>
                      {new Date().toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </small>

                  </div>

                </div>

              </div>

              {/* =================================================
                  STAT CARDS
              ================================================= */}

              <div className="stats-grid">

                <div className="stat-card cyan">

                  <div className="stat-icon">
                    💊
                  </div>

                  <div className="stat-content">

                    <h3>
                      Total Medicines
                    </h3>

                    <strong>
                      {medicines.length}
                    </strong>

                    <p>
                      Different medicines
                    </p>

                  </div>

                  <div className="card-line">
                    〰〰〰
                  </div>

                </div>

                <div className="stat-card blue">

                  <div className="stat-icon">
                    🧳
                  </div>

                  <div className="stat-content">

                    <h3>
                      Total Stock
                    </h3>

                    <strong>
                      {totalStock}
                    </strong>

                    <p>
                      Total available units
                    </p>

                  </div>

                  <div className="card-line">
                    〰〰〰
                  </div>

                </div>

                <div className="stat-card orange">

                  <div className="stat-icon">
                    ⚠
                  </div>

                  <div className="stat-content">

                    <h3>
                      Low Stock
                    </h3>

                    <strong>
                      {lowStock.length}
                    </strong>

                    <p>
                      Needs attention
                    </p>

                  </div>

                  <div className="card-line">
                    〰〰〰
                  </div>

                </div>

                <div className="stat-card purple">

                  <div className="stat-icon">
                    ◷
                  </div>

                  <div className="stat-content">

                    <h3>
                      Expiring Soon
                    </h3>

                    <strong>
                      {expiringSoon.length}
                    </strong>

                    <p>
                      Within 90 days
                    </p>

                  </div>

                  <div className="card-line">
                    〰〰〰
                  </div>

                </div>

              </div>

              {/* =================================================
                  ADD / EDIT FORM
              ================================================= */}

              {showForm && (
                <div className="form-container">

                  <div className="form-header">

                    <h2>
                      {editingMedicine
                        ? "Edit Medicine"
                        : "Add New Medicine"}
                    </h2>

                    <button
                      type="button"
                      className="close-button"
                      onClick={
                        closeForm
                      }
                    >
                      ✕
                    </button>

                  </div>

                  <form
                    onSubmit={
                      handleMedicineSubmit
                    }
                  >

                    <div className="form-grid">

                      <div className="form-group">

                        <label>
                          Medicine Name
                        </label>

                        <input
                          type="text"
                          name="name"
                          value={
                            formData.name
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Enter medicine name"
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Category
                        </label>

                        <input
                          type="text"
                          name="category"
                          value={
                            formData.category
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Example: Tablet"
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Batch Number
                        </label>

                        <input
                          type="text"
                          name="batchNumber"
                          value={
                            formData.batchNumber
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Enter batch number"
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Manufacturer
                        </label>

                        <input
                          type="text"
                          name="manufacturer"
                          value={
                            formData.manufacturer
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Enter manufacturer"
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Expiry Date
                        </label>

                        <input
                          type="date"
                          name="expiryDate"
                          value={
                            formData.expiryDate
                          }
                          onChange={
                            handleChange
                          }
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Purchase Price
                        </label>

                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="purchasePrice"
                          value={
                            formData.purchasePrice
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="0.00"
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Selling Price
                        </label>

                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="sellingPrice"
                          value={
                            formData.sellingPrice
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="0.00"
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="0"
                          name="quantity"
                          value={
                            formData.quantity
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Enter quantity"
                          required
                        />

                      </div>

                    </div>

                    <div className="form-buttons">

                      <button
                        type="button"
                        className="cancel-button"
                        onClick={
                          closeForm
                        }
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="save-button"
                      >
                        {editingMedicine
                          ? "Update Medicine"
                          : "Save Medicine"}
                      </button>

                    </div>

                  </form>

                </div>
              )}

              {/* =================================================
                  INVENTORY
              ================================================= */}

              <section className="inventory-section">

                <div className="inventory-title">

                  <div className="inventory-heading">

                    <div className="inventory-icon">
                      💊
                    </div>

                    <h2>
                      Medicine Inventory
                    </h2>

                  </div>

                  <div className="inventory-actions">

                    <input
                      type="text"
                      placeholder="Search medicine..."
                      className="search-box"
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="refresh-button"
                      onClick={
                        fetchMedicines
                      }
                    >
                      ⟳ Refresh
                    </button>

                  </div>

                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {loading && (
                  <p className="message">
                    Loading medicines...
                  </p>
                )}

                {!loading &&
                  filteredMedicines.length ===
                    0 &&
                  !error && (
                    <p className="message">
                      {search
                        ? "No medicines found."
                        : "No medicines available."}
                    </p>
                  )}

                {!loading &&
                  filteredMedicines.length >
                    0 && (

                    <div className="table-container">

                      <table>

                        <thead>

                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Batch</th>
                            <th>Manufacturer</th>
                            <th>Expiry</th>
                            <th>Quantity</th>
                            <th>Selling Price</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>

                        </thead>

                        <tbody>

                          {filteredMedicines.map(
                            (
                              medicine
                            ) => {

                              const quantity =
                                Number(
                                  medicine.quantity ||
                                    0
                                );

                              const isLowStock =
                                quantity >
                                  0 &&
                                quantity <=
                                  10;

                              const expiryDate =
                                medicine.expiryDate
                                  ? new Date(
                                      medicine.expiryDate
                                    )
                                  : null;

                              const today =
                                new Date();

                              const daysToExpiry =
                                expiryDate
                                  ? (
                                      expiryDate -
                                      today
                                    ) /
                                    (1000 *
                                      60 *
                                      60 *
                                      24)
                                  : null;

                              const isExpired =
                                expiryDate &&
                                daysToExpiry <
                                  0;

                              const isExpiringSoon =
                                expiryDate &&
                                daysToExpiry >=
                                  0 &&
                                daysToExpiry <=
                                  90;

                              return (
                                <tr
                                  key={
                                    medicine.id
                                  }
                                >

                                  <td>
                                    {
                                      medicine.id
                                    }
                                  </td>

                                  <td>
                                    <strong>
                                      {
                                        medicine.name
                                      }
                                    </strong>
                                  </td>

                                  <td>
                                    {
                                      medicine.category
                                    }
                                  </td>

                                  <td>
                                    {
                                      medicine.batchNumber
                                    }
                                  </td>

                                  <td>
                                    {
                                      medicine.manufacturer
                                    }
                                  </td>

                                  <td>

                                    {
                                      medicine.expiryDate
                                    }

                                    {isExpired && (
                                      <div className="expiry-warning">
                                        Expired
                                      </div>
                                    )}

                                    {!isExpired &&
                                      isExpiringSoon && (
                                        <div className="expiry-warning">
                                          Expiring Soon
                                        </div>
                                      )}

                                  </td>

                                  <td
                                    className={
                                      isLowStock
                                        ? "low-stock"
                                        : ""
                                    }
                                  >
                                    {
                                      quantity
                                    }
                                  </td>

                                  <td>
                                    ₹
                                    {Number(
                                      medicine.sellingPrice ||
                                        0
                                    ).toFixed(
                                      2
                                    )}
                                  </td>

                                  <td>

                                    {quantity <=
                                    0 ? (
                                      <span className="status-badge out-stock">
                                        × Out of Stock
                                      </span>
                                    ) : isExpired ? (
                                      <span className="status-badge expired">
                                        × Expired
                                      </span>
                                    ) : isLowStock ? (
                                      <span className="status-badge low-stock-badge">
                                        • Low Stock
                                      </span>
                                    ) : (
                                      <span className="status-badge in-stock">
                                        ✓ In Stock
                                      </span>
                                    )}

                                  </td>

                                  <td>

                                    <div className="medicine-actions">

                                      <button
                                        type="button"
                                        className="edit-button"
                                        onClick={() =>
                                          openEditForm(
                                            medicine
                                          )
                                        }
                                      >
                                        ✎
                                      </button>

                                      <button
                                        type="button"
                                        className="delete-button"
                                        onClick={() =>
                                          deleteMedicine(
                                            medicine.id
                                          )
                                        }
                                      >
                                        🗑
                                      </button>

                                    </div>

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>
                  )}

                <div className="inventory-footer">

                  Showing 1 to{" "}

                  {
                    filteredMedicines.length
                  }{" "}

                  of{" "}

                  {
                    filteredMedicines.length
                  }{" "}

                  medicines

                </div>

              </section>

              {/* =================================================
                  QUICK LINKS
              ================================================= */}

              <div className="quick-links">

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      "customers"
                    )
                  }
                >

                  <span>
                    ♙
                  </span>

                  <div>

                    <strong>
                      Customers
                    </strong>

                    <small>
                      Manage your customers
                    </small>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      "suppliers"
                    )
                  }
                >

                  <span>
                    ▣
                  </span>

                  <div>

                    <strong>
                      Suppliers
                    </strong>

                    <small>
                      Manage your suppliers
                    </small>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      "reports"
                    )
                  }
                >

                  <span>
                    ▥
                  </span>

                  <div>

                    <strong>
                      Reports
                    </strong>

                    <small>
                      View detailed reports
                    </small>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      "billing"
                    )
                  }
                >

                  <span>
                    ▤
                  </span>

                  <div>

                    <strong>
                      Billing
                    </strong>

                    <small>
                      Create and manage bills
                    </small>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      "profile"
                    )
                  }
                >

                  <span>
                    👤
                  </span>

                  <div>

                    <strong>
                      My Profile
                    </strong>

                    <small>
                      Manage your account
                    </small>

                  </div>

                  <b>
                    ›
                  </b>

                </button>

              </div>

            </>
          ) : (
            renderPage()
          )}

        </main>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="footer">

          <span>
            〰
          </span>

          <p>
            © 2026 MedInventory.
            All rights reserved.
          </p>

          <span>
            〰
          </span>

        </footer>

      </div>

      {/* =================================================
          AI CHATBOX
      ================================================= */}

      <AIChatbox
        medicines={medicines}
        totalBills={totalBills}
      />

    </div>
  );
}

export default App;