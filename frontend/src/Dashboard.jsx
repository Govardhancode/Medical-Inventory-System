import { useEffect, useState } from "react";
import "./Dashboard.css";
import Profile from "./Profile";

const API_URL = "https://medical-inventory-system-vtbs.onrender.com/api";

function Dashboard({ onBack, currentUser }) {
  const [medicines, setMedicines] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [restockingId, setRestockingId] = useState(null);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [medicineResponse, billResponse] = await Promise.all([
        fetch(`${API_URL}/medicines`),
        fetch(`${API_URL}/bills`),
      ]);

      if (!medicineResponse.ok) {
        throw new Error("Failed to load medicines");
      }

      if (!billResponse.ok) {
        throw new Error("Failed to load bills");
      }

      const medicineData = await medicineResponse.json();
      const billData = await billResponse.json();

      setMedicines(Array.isArray(medicineData) ? medicineData : []);
      setBills(Array.isArray(billData) ? billData : []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESTOCK
  // =====================================================

  const handleRestock = async (medicine) => {
    const RESTOCK_AMOUNT = 10;

    try {
      setRestockingId(medicine.id);
      setError("");

      const currentQuantity = Number(medicine.quantity || 0);

      const updatedMedicine = {
        name: medicine.name,
        category: medicine.category,
        batchNumber: medicine.batchNumber,
        manufacturer: medicine.manufacturer,
        expiryDate: medicine.expiryDate,
        purchasePrice: Number(medicine.purchasePrice || 0),
        sellingPrice: Number(medicine.sellingPrice || 0),
        quantity: currentQuantity + RESTOCK_AMOUNT,
      };

      const response = await fetch(
        `${API_URL}/medicines/${medicine.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMedicine),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to restock medicine");
      }

      alert(
        `${medicine.name} restocked successfully!\n\n` +
          `Added: ${RESTOCK_AMOUNT} units\n` +
          `New quantity: ${currentQuantity + RESTOCK_AMOUNT}`
      );

      await fetchDashboardData();
    } catch (err) {
      console.error("Restock error:", err);

      alert(
        "Unable to restock medicine. Please check your backend."
      );
    } finally {
      setRestockingId(null);
    }
  };

  // =====================================================
  // DATE HELPERS
  // =====================================================

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const isExpired = (medicine) => {
    if (!medicine?.expiryDate) {
      return false;
    }

    const today = getToday();

    const expiry = new Date(medicine.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    return expiry < today;
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN");
  };

  // =====================================================
  // INVENTORY STATISTICS
  // =====================================================

  const totalMedicines = medicines.length;

  const totalStock = medicines.reduce(
    (sum, medicine) =>
      sum + Number(medicine.quantity || 0),
    0
  );

  const outOfStock = medicines.filter(
    (medicine) =>
      Number(medicine.quantity || 0) <= 0
  );

  const lowStock = medicines.filter((medicine) => {
    const quantity = Number(medicine.quantity || 0);

    return quantity > 0 && quantity <= 10;
  });

  const inStock = medicines.filter(
    (medicine) =>
      Number(medicine.quantity || 0) > 10 &&
      !isExpired(medicine)
  );

  const expiredMedicines = medicines.filter((medicine) =>
    isExpired(medicine)
  );

  // =====================================================
  // EXPIRING SOON
  // =====================================================

  const expiringSoon = medicines.filter((medicine) => {
    if (
      !medicine.expiryDate ||
      isExpired(medicine)
    ) {
      return false;
    }

    const today = getToday();

    const expiry = new Date(medicine.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const difference =
      (expiry - today) /
      (1000 * 60 * 60 * 24);

    return difference >= 0 && difference <= 90;
  });

  // =====================================================
  // BILL STATISTICS
  // =====================================================

  const totalBills = bills.length;

  const totalSales = bills.reduce(
    (sum, bill) =>
      sum + Number(bill.totalAmount || 0),
    0
  );

  const averageBillValue =
    totalBills > 0
      ? totalSales / totalBills
      : 0;

  const totalUnitsSold = bills.reduce(
    (sum, bill) => {
      if (!Array.isArray(bill.items)) {
        return sum;
      }

      return (
        sum +
        bill.items.reduce(
          (itemSum, item) =>
            itemSum +
            Number(item.quantity || 0),
          0
        )
      );
    },
    0
  );

  const getBillDate = (bill) => {
    return (
      bill?.billDate ||
      bill?.createdAt ||
      bill?.date
    );
  };

  // =====================================================
  // 7 DAY SALES
  // =====================================================

  const salesTrend = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date();

      date.setHours(0, 0, 0, 0);

      date.setDate(
        date.getDate() - (6 - index)
      );

      const nextDate = new Date(date);

      nextDate.setDate(
        nextDate.getDate() + 1
      );

      const revenue = bills.reduce(
        (sum, bill) => {
          const billDate = getBillDate(bill);

          if (!billDate) {
            return sum;
          }

          const parsedDate = new Date(billDate);

          if (
            parsedDate >= date &&
            parsedDate < nextDate
          ) {
            return (
              sum +
              Number(
                bill.totalAmount || 0
              )
            );
          }

          return sum;
        },
        0
      );

      return {
        date,
        label: date.toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
          }
        ),
        revenue,
      };
    }
  );

  const maxDailySales = Math.max(
    ...salesTrend.map(
      (day) => day.revenue
    ),
    1
  );

  // =====================================================
  // CURRENT MONTH SALES
  // =====================================================

  const currentMonth = new Date();

  const currentMonthRevenue = bills.reduce(
    (sum, bill) => {
      const billDate = getBillDate(bill);

      if (!billDate) {
        return sum;
      }

      const parsedDate = new Date(billDate);

      if (
        parsedDate.getMonth() ===
          currentMonth.getMonth() &&
        parsedDate.getFullYear() ===
          currentMonth.getFullYear()
      ) {
        return (
          sum +
          Number(
            bill.totalAmount || 0
          )
        );
      }

      return sum;
    },
    0
  );

  // =====================================================
  // RECENT BILLS
  // =====================================================

  const recentBills = [...bills]
    .sort(
      (a, b) =>
        new Date(
          getBillDate(b) || 0
        ) -
        new Date(
          getBillDate(a) || 0
        )
    )
    .slice(0, 5);

  // =====================================================
  // TOP SELLING MEDICINES
  // =====================================================

  const medicineSales = {};

  bills.forEach((bill) => {
    if (!Array.isArray(bill.items)) {
      return;
    }

    bill.items.forEach((item) => {
      const medicineName =
        item?.medicine?.name ||
        item?.medicineName ||
        "Unknown Medicine";

      const quantity =
        Number(item.quantity || 0);

      if (!medicineSales[medicineName]) {
        medicineSales[medicineName] = 0;
      }

      medicineSales[medicineName] += quantity;
    });
  });

  const topSellingMedicines =
    Object.entries(medicineSales)
      .map(([name, quantity]) => ({
        name,
        quantity,
      }))
      .sort(
        (a, b) =>
          b.quantity - a.quantity
      )
      .slice(0, 5);

  // =====================================================
  // STOCK STATUS
  // =====================================================

  const getStockStatus = (medicine) => {
    const quantity =
      Number(medicine.quantity || 0);

    if (quantity <= 0) {
      return {
        label: "OUT OF STOCK",
        icon: "●",
        type: "danger",
      };
    }

    if (quantity <= 5) {
      return {
        label: "CRITICAL",
        icon: "●",
        type: "critical",
      };
    }

    return {
      label: "LOW STOCK",
      icon: "●",
      type: "warning",
    };
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-medical-icon">
            🩺
          </div>

          <div className="loading-spinner"></div>

          <h2>
            Loading MedInventory
          </h2>

          <p>
            Preparing your medical dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PROFILE
  // =====================================================

  if (showProfile) {
    return (
      <Profile
        currentUser={currentUser}
        stats={{
          totalMedicines,
          totalStock,
          lowStock: lowStock.length,
          expiringSoon: expiringSoon.length,
          totalBills,
          totalSales,
        }}
        onBack={() =>
          setShowProfile(false)
        }
      />
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* ================================================
          MEDICAL HEADER
      ================================================ */}

      <header className="dashboard-header">

        <div className="dashboard-brand">

          <div className="medical-logo">
            <span>✚</span>
          </div>

          <div>
            <h1>
              MedInventory
            </h1>

            <p>
              Medical Inventory & Sales Management
            </p>
          </div>

        </div>

        <div className="dashboard-header-actions">

          <button
            className="dashboard-profile-button"
            onClick={() =>
              setShowProfile(true)
            }
          >
            <span>👤</span>
            Profile
          </button>

          <button
            className="dashboard-refresh-button"
            onClick={fetchDashboardData}
          >
            <span>↻</span>
            Refresh
          </button>

          <button
            className="dashboard-back-button"
            onClick={onBack}
          >
            ← Inventory
          </button>

        </div>

      </header>

      {/* ================================================
          SYSTEM STATUS
      ================================================ */}

      <div className="system-status">

        <div className="status-indicator">
          <span></span>
          System Online
        </div>

        <div className="status-divider"></div>

        <div>
          Medical Inventory Management
        </div>

        <div className="status-divider"></div>

        <div>
          Live Data
        </div>

      </div>

      {/* ================================================
          ERROR
      ================================================ */}

      {error && (
        <div className="dashboard-error">
          <span>⚠</span>
          {error}
        </div>
      )}

      {/* ================================================
          KPI CARDS
      ================================================ */}

      <div className="dashboard-stat-grid">

        <div className="dashboard-stat-card medicine-card">

          <div className="stat-icon">
            💊
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Total Medicines
            </span>

            <strong className="stat-number">
              {totalMedicines}
            </strong>

            <span className="stat-description">
              Different medicines
            </span>
          </div>

          <div className="card-glow"></div>

        </div>

        <div className="dashboard-stat-card stock-card">

          <div className="stat-icon">
            📦
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Total Stock
            </span>

            <strong className="stat-number">
              {totalStock}
            </strong>

            <span className="stat-description">
              Available units
            </span>
          </div>

          <div className="card-glow"></div>

        </div>

        <div className="dashboard-stat-card warning-card">

          <div className="stat-icon">
            ⚠️
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Low Stock
            </span>

            <strong className="stat-number">
              {lowStock.length}
            </strong>

            <span className="stat-description">
              Needs attention
            </span>
          </div>

          <div className="card-glow"></div>

        </div>

        <div className="dashboard-stat-card expiry-card">

          <div className="stat-icon">
            ⏰
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Expiring Soon
            </span>

            <strong className="stat-number">
              {expiringSoon.length}
            </strong>

            <span className="stat-description">
              Within 90 days
            </span>
          </div>

          <div className="card-glow"></div>

        </div>

        <div className="dashboard-stat-card bill-card">

          <div className="stat-icon">
            🧾
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Total Bills
            </span>

            <strong className="stat-number">
              {totalBills}
            </strong>

            <span className="stat-description">
              Bills generated
            </span>
          </div>

          <div className="card-glow"></div>

        </div>

        <div className="dashboard-stat-card sales-card">

          <div className="stat-icon">
            💰
          </div>

          <div className="stat-content">
            <span className="stat-label">
              Total Sales
            </span>

            <strong className="stat-number">
              {formatCurrency(totalSales)}
            </strong>

            <span className="stat-description">
              Overall revenue
            </span>
          </div>

          <div className="card-glow"></div>

        </div>

      </div>

      {/* ================================================
          SALES ANALYTICS
      ================================================ */}

      <section className="dashboard-section analytics-section">

        <div className="section-header">

          <div>
            <div className="section-title">
              <span className="section-icon">
                📈
              </span>

              <div>
                <h2>
                  Sales Analytics
                </h2>

                <p>
                  Revenue and sales performance overview
                </p>
              </div>
            </div>
          </div>

          <span className="live-badge">
            <span></span>
            LIVE BILLING DATA
          </span>

        </div>

        <div className="analytics-cards">

          <div className="analytics-card revenue">

            <span className="analytics-icon">
              ₹
            </span>

            <span className="analytics-label">
              Total Revenue
            </span>

            <strong>
              {formatCurrency(totalSales)}
            </strong>

          </div>

          <div className="analytics-card average">

            <span className="analytics-icon">
              🧾
            </span>

            <span className="analytics-label">
              Average Bill
            </span>

            <strong>
              {formatCurrency(averageBillValue)}
            </strong>

          </div>

          <div className="analytics-card units">

            <span className="analytics-icon">
              💊
            </span>

            <span className="analytics-label">
              Units Sold
            </span>

            <strong>
              {totalUnitsSold}
            </strong>

          </div>

          <div className="analytics-card month">

            <span className="analytics-icon">
              📅
            </span>

            <span className="analytics-label">
              This Month
            </span>

            <strong>
              {formatCurrency(currentMonthRevenue)}
            </strong>

          </div>

        </div>

        {/* 7 DAY SALES */}

        <div className="sales-chart">

          <div className="chart-header">

            <div>
              <h3>
                Last 7 Days Sales
              </h3>

              <p>
                Daily revenue based on generated bills
              </p>
            </div>

            <div className="chart-max">
              Max{" "}
              <strong>
                {formatCurrency(maxDailySales)}
              </strong>
            </div>

          </div>

          <div className="chart-area">

            {salesTrend.map((day) => {

              const height =
                day.revenue > 0
                  ? Math.max(
                      10,
                      (day.revenue /
                        maxDailySales) *
                        160
                    )
                  : 5;

              return (
                <div
                  className="chart-column"
                  key={day.date.toISOString()}
                >

                  <span className="chart-value">
                    {formatCurrency(day.revenue)}
                  </span>

                  <div
                    className="chart-bar"
                    style={{
                      height: `${height}px`,
                    }}
                    title={`${day.label}: ${formatCurrency(
                      day.revenue
                    )}`}
                  ></div>

                  <span className="chart-day">
                    {day.label}
                  </span>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* ================================================
          INVENTORY STATUS
      ================================================ */}

      <section className="dashboard-section">

        <div className="section-header">

          <div className="section-title">

            <span className="section-icon">
              📦
            </span>

            <div>
              <h2>
                Inventory Status
              </h2>

              <p>
                Current medicine stock condition
              </p>
            </div>

          </div>

          <span className="section-count">
            {totalMedicines} medicines
          </span>

        </div>

        <div className="inventory-status-grid">

          <div className="inventory-status-card healthy">

            <div className="inventory-status-icon">
              ✓
            </div>

            <div>
              <span>
                In Stock
              </span>

              <strong>
                {inStock.length}
              </strong>

              <small>
                Medicines available
              </small>
            </div>

          </div>

          <div className="inventory-status-card low">

            <div className="inventory-status-icon">
              !
            </div>

            <div>
              <span>
                Low Stock
              </span>

              <strong>
                {lowStock.length}
              </strong>

              <small>
                1 - 10 units
              </small>
            </div>

          </div>

          <div className="inventory-status-card empty">

            <div className="inventory-status-icon">
              ×
            </div>

            <div>
              <span>
                Out of Stock
              </span>

              <strong>
                {outOfStock.length}
              </strong>

              <small>
                0 units available
              </small>
            </div>

          </div>

          <div className="inventory-status-card expired">

            <div className="inventory-status-icon">
              ⛔
            </div>

            <div>
              <span>
                Expired
              </span>

              <strong>
                {expiredMedicines.length}
              </strong>

              <small>
                Past expiry date
              </small>
            </div>

          </div>

        </div>

      </section>

      {/* ================================================
          LOW STOCK ALERTS
      ================================================ */}

      <section className="dashboard-section">

        <div className="section-header">

          <div className="section-title">

            <span className="section-icon warning-icon">
              ⚠
            </span>

            <div>
              <h2>
                Low Stock Alerts
              </h2>

              <p>
                Medicines requiring immediate attention
              </p>
            </div>

          </div>

          <span
            className={
              lowStock.length +
                outOfStock.length >
              0
                ? "alert-badge danger"
                : "alert-badge success"
            }
          >
            {lowStock.length +
              outOfStock.length}{" "}
            Alert
            {lowStock.length +
              outOfStock.length !==
            1
              ? "s"
              : ""}
          </span>

        </div>

        {lowStock.length === 0 &&
        outOfStock.length === 0 ? (

          <div className="healthy-message">
            <span>✓</span>

            <div>
              <strong>
                All stock levels are healthy!
              </strong>

              <p>
                No medicines require restocking right now.
              </p>
            </div>
          </div>

        ) : (

          <div className="stock-alert-list">

            {[
              ...outOfStock,
              ...lowStock,
            ].map((medicine) => {

              const status =
                getStockStatus(medicine);

              const quantity =
                Number(
                  medicine.quantity || 0
                );

              const isRestocking =
                restockingId ===
                medicine.id;

              return (
                <div
                  className={`stock-alert-item ${status.type}`}
                  key={medicine.id}
                >

                  <div className="medicine-alert-icon">
                    💊
                  </div>

                  <div className="medicine-alert-info">

                    <strong>
                      {medicine.name}
                    </strong>

                    <span>
                      Batch:{" "}
                      {medicine.batchNumber || "-"}
                    </span>

                    <span>
                      Category:{" "}
                      {medicine.category || "-"}
                    </span>

                  </div>

                  <div className="current-stock">

                    <small>
                      CURRENT STOCK
                    </small>

                    <strong>
                      {quantity}
                    </strong>

                    <span>
                      units
                    </span>

                  </div>

                  <div
                    className={`stock-status ${status.type}`}
                  >
                    <span>
                      {status.icon}
                    </span>

                    {status.label}
                  </div>

                  <button
                    className="restock-button"
                    onClick={() =>
                      handleRestock(medicine)
                    }
                    disabled={isRestocking}
                  >
                    {isRestocking
                      ? "Updating..."
                      : "↻ Restock +10"}
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* ================================================
          STOCK DISTRIBUTION
      ================================================ */}

      <section className="dashboard-section">

        <div className="section-header">

          <div className="section-title">

            <span className="section-icon">
              ◉
            </span>

            <div>
              <h2>
                Stock Distribution
              </h2>

              <p>
                Medicine inventory breakdown
              </p>
            </div>

          </div>

          <span className="section-count">
            {totalMedicines} total
          </span>

        </div>

        <div className="distribution-list">

          {[
            {
              label: "In Stock",
              count: inStock.length,
              type: "healthy",
            },
            {
              label: "Low Stock",
              count: lowStock.length,
              type: "low",
            },
            {
              label: "Out of Stock",
              count: outOfStock.length,
              type: "empty",
            },
            {
              label: "Expired",
              count: expiredMedicines.length,
              type: "expired",
            },
          ].map((item) => {

            const percentage =
              totalMedicines > 0
                ? (item.count /
                    totalMedicines) *
                  100
                : 0;

            return (
              <div
                className="distribution-item"
                key={item.label}
              >

                <div className="distribution-header">

                  <span
                    className={`distribution-label ${item.type}`}
                  >
                    <i></i>
                    {item.label}
                  </span>

                  <strong>
                    {item.count}
                  </strong>

                </div>

                <div className="distribution-track">

                  <div
                    className={`distribution-progress ${item.type}`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  ></div>

                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* ================================================
          RECENT BILLS + TOP SELLING
      ================================================ */}

      <div className="dashboard-content-grid">

        {/* RECENT BILLS */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="panel-title-row">

                <span>
                  🧾
                </span>

                <h2>
                  Recent Bills
                </h2>

              </div>

              <p>
                Latest generated invoices
              </p>

            </div>

          </div>

          {recentBills.length === 0 ? (

            <div className="empty-dashboard">

              <div className="empty-icon">
                🧾
              </div>

              <p>
                No bills available yet.
              </p>

            </div>

          ) : (

            <div className="dashboard-table-container">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>
                      BILL NUMBER
                    </th>

                    <th>
                      CUSTOMER
                    </th>

                    <th>
                      DATE
                    </th>

                    <th>
                      AMOUNT
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {recentBills.map(
                    (bill) => (
                      <tr key={bill.id}>

                        <td>
                          <strong>
                            {bill.billNumber || "-"}
                          </strong>
                        </td>

                        <td>
                          {bill.customer?.name || "-"}
                        </td>

                        <td>
                          {formatDate(
                            getBillDate(bill)
                          )}
                        </td>

                        <td className="amount-cell">
                          {formatCurrency(
                            bill.totalAmount
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* TOP SELLING */}

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div className="panel-title-row">

                <span>
                  🏆
                </span>

                <h2>
                  Top Medicines
                </h2>

              </div>

              <p>
                Most sold medicines
              </p>

            </div>

          </div>

          {topSellingMedicines.length === 0 ? (

            <div className="empty-dashboard">

              <div className="empty-icon">
                💊
              </div>

              <p>
                No sales data available yet.
              </p>

            </div>

          ) : (

            <div className="top-medicine-list">

              {topSellingMedicines.map(
                (medicine, index) => {

                  const maxQuantity =
                    topSellingMedicines[0]
                      ?.quantity || 0;

                  const width =
                    maxQuantity > 0
                      ? (medicine.quantity /
                          maxQuantity) *
                        100
                      : 0;

                  return (
                    <div
                      className="top-medicine-item"
                      key={medicine.name}
                    >

                      <div className="medicine-rank">
                        {index + 1}
                      </div>

                      <div className="medicine-info">

                        <strong>
                          {medicine.name}
                        </strong>

                        <span>
                          {medicine.quantity} units sold
                        </span>

                        <div className="medicine-bar-container">

                          <div
                            className="medicine-bar"
                            style={{
                              width: `${width}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>

      {/* ================================================
          LOW STOCK + EXPIRING
      ================================================ */}

      <div className="dashboard-alert-grid">

        <div className="alert-panel">

          <div className="alert-panel-header">

            <div className="panel-title-row">

              <span>
                ⚠️
              </span>

              <h2>
                Low Stock Medicines
              </h2>

            </div>

            <span className="alert-count">
              {lowStock.length}
            </span>

          </div>

          {lowStock.length === 0 ? (

            <div className="success-message">
              ✓ All medicines have sufficient stock.
            </div>

          ) : (

            <div className="alert-list">

              {lowStock
                .slice(0, 5)
                .map((medicine) => (

                  <div
                    className="alert-item"
                    key={medicine.id}
                  >

                    <div>

                      <strong>
                        {medicine.name}
                      </strong>

                      <span>
                        Batch:{" "}
                        {medicine.batchNumber || "-"}
                      </span>

                    </div>

                    <span className="stock-warning">
                      {medicine.quantity} left
                    </span>

                  </div>

                ))}

            </div>
          )}

        </div>

        <div className="alert-panel">

          <div className="alert-panel-header">

            <div className="panel-title-row">

              <span>
                ⏰
              </span>

              <h2>
                Expiring Soon
              </h2>

            </div>

            <span className="alert-count expiry-count">
              {expiringSoon.length}
            </span>

          </div>

          {expiringSoon.length === 0 ? (

            <div className="success-message">
              ✓ No medicines expiring within 90 days.
            </div>

          ) : (

            <div className="alert-list">

              {expiringSoon
                .slice(0, 5)
                .map((medicine) => (

                  <div
                    className="alert-item"
                    key={medicine.id}
                  >

                    <div>

                      <strong>
                        {medicine.name}
                      </strong>

                      <span>
                        Batch:{" "}
                        {medicine.batchNumber || "-"}
                      </span>

                    </div>

                    <span className="expiry-warning">
                      {formatDate(
                        medicine.expiryDate
                      )}
                    </span>

                  </div>

                ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;