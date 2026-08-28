import { useEffect, useMemo, useState } from "react";
import "./Reports.css";

const API_URL = "https://medical-inventory-backend-li17.onrender.com/api";

function Reports({ onBack }) {
  const [medicines, setMedicines] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError("");

      const [medicineResponse, billResponse] =
        await Promise.all([
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
      console.error(err);
      setError("Unable to load report data. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DATE HELPERS
  // =====================================================

  const getBillDate = (bill) => {
    return bill.billDate || bill.createdAt || bill.date;
  };

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getStartDate = () => {
    const today = getToday();

    if (dateFilter === "today") {
      return today;
    }

    if (dateFilter === "7days") {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return start;
    }

    if (dateFilter === "30days") {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return start;
    }

    if (dateFilter === "month") {
      return new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
    }

    return null;
  };

  const filteredBills = useMemo(() => {
    if (dateFilter === "all") {
      return bills;
    }

    const startDate = getStartDate();
    const today = getToday();

    if (!startDate) {
      return bills;
    }

    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    return bills.filter((bill) => {
      const billDateValue = getBillDate(bill);

      if (!billDateValue) {
        return false;
      }

      const billDate = new Date(billDateValue);

      return billDate >= startDate && billDate <= endDate;
    });
  }, [bills, dateFilter]);

  // =====================================================
  // INVENTORY STATISTICS
  // =====================================================

  const totalMedicines = medicines.length;

  const totalStock = medicines.reduce(
    (sum, medicine) =>
      sum + Number(medicine.quantity || 0),
    0
  );

  const lowStockMedicines = medicines.filter((medicine) => {
    const quantity = Number(medicine.quantity || 0);
    return quantity > 0 && quantity <= 10;
  });

  const outOfStockMedicines = medicines.filter(
    (medicine) =>
      Number(medicine.quantity || 0) <= 0
  );

  const isExpired = (medicine) => {
    if (!medicine.expiryDate) {
      return false;
    }

    const today = getToday();

    const expiry = new Date(medicine.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    return expiry < today;
  };

  const expiredMedicines = medicines.filter(
    (medicine) => isExpired(medicine)
  );

  const expiringSoonMedicines = medicines.filter(
    (medicine) => {
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
    }
  );

  // =====================================================
  // SALES STATISTICS
  // =====================================================

  const totalBills = filteredBills.length;

  const totalRevenue = filteredBills.reduce(
    (sum, bill) =>
      sum + Number(bill.totalAmount || 0),
    0
  );

  const averageBillValue =
    totalBills > 0
      ? totalRevenue / totalBills
      : 0;

  const totalUnitsSold = filteredBills.reduce(
    (sum, bill) => {
      if (!bill.items) {
        return sum;
      }

      return (
        sum +
        bill.items.reduce(
          (itemSum, item) =>
            itemSum + Number(item.quantity || 0),
          0
        )
      );
    },
    0
  );

  // =====================================================
  // TODAY'S SALES
  // =====================================================

  const today = getToday();

  const todayBills = bills.filter((bill) => {
    const billDateValue = getBillDate(bill);

    if (!billDateValue) {
      return false;
    }

    return isSameDay(
      new Date(billDateValue),
      today
    );
  });

  const todayRevenue = todayBills.reduce(
    (sum, bill) =>
      sum + Number(bill.totalAmount || 0),
    0
  );

  // =====================================================
  // TOP SELLING MEDICINES
  // =====================================================

  const topSellingMedicines = useMemo(() => {
    const sales = {};

    filteredBills.forEach((bill) => {
      if (!bill.items) {
        return;
      }

      bill.items.forEach((item) => {
        const medicineName =
          item.medicine?.name ||
          item.medicineName ||
          "Unknown Medicine";

        const quantity = Number(
          item.quantity || 0
        );

        if (!sales[medicineName]) {
          sales[medicineName] = 0;
        }

        sales[medicineName] += quantity;
      });
    });

    return Object.entries(sales)
      .map(([name, quantity]) => ({
        name,
        quantity,
      }))
      .sort(
        (a, b) => b.quantity - a.quantity
      )
      .slice(0, 5);
  }, [filteredBills]);

  // =====================================================
  // SALES TREND
  // =====================================================

  const salesTrend = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const revenue = bills.reduce(
        (sum, bill) => {
          const billDateValue = getBillDate(bill);

          if (!billDateValue) {
            return sum;
          }

          const billDate = new Date(
            billDateValue
          );

          if (
            billDate >= date &&
            billDate < nextDate
          ) {
            return (
              sum +
              Number(bill.totalAmount || 0)
            );
          }

          return sum;
        },
        0
      );

      days.push({
        date,
        label: date.toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
          }
        ),
        revenue,
      });
    }

    return days;
  }, [bills]);

  const maxRevenue = Math.max(
    ...salesTrend.map(
      (day) => day.revenue
    ),
    1
  );

  // =====================================================
  // CATEGORY DISTRIBUTION
  // =====================================================

  const categoryData = useMemo(() => {
    const categories = {};

    medicines.forEach((medicine) => {
      const category =
        medicine.category ||
        "Other";

      if (!categories[category]) {
        categories[category] = 0;
      }

      categories[category]++;
    });

    return Object.entries(categories)
      .map(([category, count]) => ({
        category,
        count,
      }))
      .sort(
        (a, b) => b.count - a.count
      );
  }, [medicines]);

  // =====================================================
  // FORMATTING
  // =====================================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="reports-loading-icon">
            📊
          </div>

          <h2>Loading Reports...</h2>

          <p>
            Please wait while we collect your
            inventory and sales data.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="reports-header">

        <div>
          <h1>📊 Reports & Analytics</h1>

          <p>
            Medical inventory and sales performance
            overview
          </p>
        </div>

        <div className="reports-header-actions">

          <button
            className="reports-refresh-button"
            onClick={fetchReportsData}
          >
            🔄 Refresh
          </button>

          <button
            className="reports-back-button"
            onClick={onBack}
          >
            ← Back
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="reports-error">
          ⚠️ {error}
        </div>
      )}

      {/* DATE FILTER */}

      <section className="reports-filter-card">

        <div>
          <h3>📅 Report Period</h3>

          <p>
            Select the period for sales analysis
          </p>
        </div>

        <select
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(e.target.value)
          }
          className="reports-date-select"
        >
          <option value="all">
            All Time
          </option>

          <option value="today">
            Today
          </option>

          <option value="7days">
            Last 7 Days
          </option>

          <option value="30days">
            Last 30 Days
          </option>

          <option value="month">
            This Month
          </option>
        </select>

      </section>

      {/* SALES KPI */}

      <section className="reports-section">

        <div className="reports-section-title">

          <div>
            <h2>💰 Sales Summary</h2>

            <p>
              Revenue and billing performance
            </p>
          </div>

          <span className="live-badge">
            Live Data
          </span>

        </div>

        <div className="reports-kpi-grid">

          <div className="report-kpi revenue-kpi">
            <div className="report-kpi-icon">
              💰
            </div>

            <div>
              <span>Total Revenue</span>

              <strong>
                {formatCurrency(totalRevenue)}
              </strong>
            </div>
          </div>

          <div className="report-kpi bills-kpi">
            <div className="report-kpi-icon">
              🧾
            </div>

            <div>
              <span>Total Bills</span>

              <strong>
                {totalBills}
              </strong>
            </div>
          </div>

          <div className="report-kpi units-kpi">
            <div className="report-kpi-icon">
              💊
            </div>

            <div>
              <span>Units Sold</span>

              <strong>
                {totalUnitsSold}
              </strong>
            </div>
          </div>

          <div className="report-kpi average-kpi">
            <div className="report-kpi-icon">
              🧮
            </div>

            <div>
              <span>Average Bill</span>

              <strong>
                {formatCurrency(
                  averageBillValue
                )}
              </strong>
            </div>
          </div>

          <div className="report-kpi today-kpi">
            <div className="report-kpi-icon">
              📅
            </div>

            <div>
              <span>Today's Revenue</span>

              <strong>
                {formatCurrency(todayRevenue)}
              </strong>
            </div>
          </div>

        </div>

      </section>

      {/* INVENTORY KPI */}

      <section className="reports-section">

        <div className="reports-section-title">

          <div>
            <h2>📦 Inventory Summary</h2>

            <p>
              Current medicine stock condition
            </p>
          </div>

        </div>

        <div className="reports-kpi-grid inventory-kpi-grid">

          <div className="report-kpi inventory-total-kpi">
            <div className="report-kpi-icon">
              💊
            </div>

            <div>
              <span>Total Medicines</span>

              <strong>
                {totalMedicines}
              </strong>
            </div>
          </div>

          <div className="report-kpi stock-kpi">
            <div className="report-kpi-icon">
              📦
            </div>

            <div>
              <span>Total Stock</span>

              <strong>
                {totalStock}
              </strong>
            </div>
          </div>

          <div className="report-kpi low-kpi">
            <div className="report-kpi-icon">
              ⚠️
            </div>

            <div>
              <span>Low Stock</span>

              <strong>
                {lowStockMedicines.length}
              </strong>
            </div>
          </div>

          <div className="report-kpi out-kpi">
            <div className="report-kpi-icon">
              🔴
            </div>

            <div>
              <span>Out of Stock</span>

              <strong>
                {outOfStockMedicines.length}
              </strong>
            </div>
          </div>

          <div className="report-kpi expired-kpi">
            <div className="report-kpi-icon">
              ⛔
            </div>

            <div>
              <span>Expired</span>

              <strong>
                {expiredMedicines.length}
              </strong>
            </div>
          </div>

          <div className="report-kpi expiring-kpi">
            <div className="report-kpi-icon">
              ⏰
            </div>

            <div>
              <span>Expiring Soon</span>

              <strong>
                {expiringSoonMedicines.length}
              </strong>
            </div>
          </div>

        </div>

      </section>

      {/* SALES TREND + TOP SELLING */}

      <div className="reports-two-column">

        {/* SALES TREND */}

        <section className="reports-panel">

          <div className="reports-panel-header">

            <div>
              <h2>📈 Sales Trend</h2>

              <p>
                Revenue for the last 7 days
              </p>
            </div>

            <span className="panel-badge">
              7 Days
            </span>

          </div>

          <div className="sales-chart">

            {salesTrend.map((day) => {

              const height =
                day.revenue > 0
                  ? Math.max(
                      12,
                      (day.revenue /
                        maxRevenue) *
                        160
                    )
                  : 5;

              return (
                <div
                  className="sales-chart-item"
                  key={day.date.toISOString()}
                >

                  <div className="chart-value">
                    {formatCurrency(
                      day.revenue
                    )}
                  </div>

                  <div className="chart-bar-wrapper">

                    <div
                      className="chart-bar"
                      style={{
                        height: `${height}px`,
                      }}
                      title={`${day.label}: ${formatCurrency(
                        day.revenue
                      )}`}
                    />

                  </div>

                  <div className="chart-label">
                    {day.label}
                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* TOP SELLING */}

        <section className="reports-panel">

          <div className="reports-panel-header">

            <div>
              <h2>🏆 Top Selling Medicines</h2>

              <p>
                Most frequently sold medicines
              </p>
            </div>

          </div>

          {topSellingMedicines.length === 0 ? (

            <div className="reports-empty">
              <div>💊</div>

              <p>
                No sales data available.
              </p>
            </div>

          ) : (

            <div className="top-selling-list">

              {topSellingMedicines.map(
                (medicine, index) => {

                  const maxQuantity =
                    topSellingMedicines[0]
                      ?.quantity || 1;

                  const percentage =
                    (medicine.quantity /
                      maxQuantity) *
                    100;

                  return (
                    <div
                      className="top-selling-item"
                      key={medicine.name}
                    >

                      <div className="rank">
                        {index + 1}
                      </div>

                      <div className="top-selling-details">

                        <div className="top-selling-name">
                          {medicine.name}
                        </div>

                        <div className="top-selling-quantity">
                          {medicine.quantity} units
                          sold
                        </div>

                        <div className="top-selling-progress">

                          <div
                            style={{
                              width: `${percentage}%`,
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

        </section>

      </div>

      {/* INVENTORY ALERTS */}

      <div className="reports-two-column">

        {/* LOW STOCK */}

        <section className="reports-panel">

          <div className="reports-panel-header">

            <div>
              <h2>⚠️ Low Stock Medicines</h2>

              <p>
                Medicines requiring attention
              </p>
            </div>

            <span className="count-badge warning-count">
              {lowStockMedicines.length}
            </span>

          </div>

          {lowStockMedicines.length === 0 ? (

            <div className="reports-success">
              ✅ All medicines have sufficient
              stock.
            </div>

          ) : (

            <div className="report-medicine-list">

              {lowStockMedicines
                .slice(0, 6)
                .map((medicine) => (

                  <div
                    className="report-medicine-item"
                    key={medicine.id}
                  >

                    <div className="medicine-icon">
                      💊
                    </div>

                    <div className="report-medicine-info">

                      <strong>
                        {medicine.name}
                      </strong>

                      <span>
                        Batch:{" "}
                        {medicine.batchNumber ||
                          "-"}
                      </span>

                    </div>

                    <div className="report-stock-value">
                      {medicine.quantity} left
                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

        {/* EXPIRING */}

        <section className="reports-panel">

          <div className="reports-panel-header">

            <div>
              <h2>⏰ Expiring Soon</h2>

              <p>
                Medicines expiring within 90 days
              </p>
            </div>

            <span className="count-badge expiry-count">
              {expiringSoonMedicines.length}
            </span>

          </div>

          {expiringSoonMedicines.length ===
          0 ? (

            <div className="reports-success">
              ✅ No medicines expiring within
              90 days.
            </div>

          ) : (

            <div className="report-medicine-list">

              {expiringSoonMedicines
                .slice(0, 6)
                .map((medicine) => (

                  <div
                    className="report-medicine-item"
                    key={medicine.id}
                  >

                    <div className="medicine-icon expiry-icon">
                      ⏰
                    </div>

                    <div className="report-medicine-info">

                      <strong>
                        {medicine.name}
                      </strong>

                      <span>
                        Batch:{" "}
                        {medicine.batchNumber ||
                          "-"}
                      </span>

                    </div>

                    <div className="report-expiry-value">
                      {formatDate(
                        medicine.expiryDate
                      )}
                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

      </div>

      {/* CATEGORY DISTRIBUTION */}

      <section className="reports-panel category-panel">

        <div className="reports-panel-header">

          <div>
            <h2>🗂️ Medicine Categories</h2>

            <p>
              Distribution of medicines by category
            </p>
          </div>

          <span className="panel-badge">
            {categoryData.length} Categories
          </span>

        </div>

        {categoryData.length === 0 ? (

          <div className="reports-empty">
            <div>💊</div>

            <p>
              No medicine categories available.
            </p>
          </div>

        ) : (

          <div className="category-list">

            {categoryData.map(
              (category) => {

                const percentage =
                  totalMedicines > 0
                    ? (category.count /
                        totalMedicines) *
                      100
                    : 0;

                return (
                  <div
                    className="category-row"
                    key={category.category}
                  >

                    <div className="category-name">
                      <strong>
                        {category.category}
                      </strong>

                      <span>
                        {category.count} medicine
                        {category.count !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                    <div className="category-progress">

                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                    <div className="category-percentage">
                      {percentage.toFixed(0)}%
                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

      {/* RECENT BILLS */}

      <section className="reports-panel recent-bills-panel">

        <div className="reports-panel-header">

          <div>
            <h2>🧾 Recent Bills</h2>

            <p>
              Latest bills in the selected report
              period
            </p>
          </div>

          <span className="panel-badge">
            {filteredBills.length} Bills
          </span>

        </div>

        {filteredBills.length === 0 ? (

          <div className="reports-empty">
            <div>🧾</div>

            <p>
              No bills available for this period.
            </p>
          </div>

        ) : (

          <div className="reports-table-container">

            <table className="reports-table">

              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>

                {[...filteredBills]
                  .sort(
                    (a, b) =>
                      new Date(
                        getBillDate(b) || 0
                      ) -
                      new Date(
                        getBillDate(a) || 0
                      )
                  )
                  .slice(0, 10)
                  .map((bill) => (

                    <tr key={bill.id}>

                      <td>
                        <strong>
                          {bill.billNumber ||
                            `BILL-${bill.id}`}
                        </strong>
                      </td>

                      <td>
                        {bill.customer?.name ||
                          "-"}
                      </td>

                      <td>
                        {formatDate(
                          getBillDate(bill)
                        )}
                      </td>

                      <td className="table-amount">
                        {formatCurrency(
                          bill.totalAmount
                        )}
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

      {/* FOOTER */}

      <div className="reports-footer">

        <span>
          📊 Reports are generated from your
          current inventory and billing data.
        </span>

        <span>
          Last refreshed:{" "}
          {new Date().toLocaleString("en-IN")}
        </span>

      </div>

    </div>
  );
}

export default Reports;
