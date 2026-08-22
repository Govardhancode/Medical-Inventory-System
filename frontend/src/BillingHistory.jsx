import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

function BillingHistory({ onBack }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);

  // =====================================================
  // LOAD BILLS
  // =====================================================

  useEffect(() => {
    fetchBills();
  }, []);

  // =====================================================
  // FETCH BILLS
  // =====================================================

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/bills`);

      if (!response.ok) {
        throw new Error("Failed to load billing history");
      }

      const data = await response.json();

      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load billing history. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE BILL
  // =====================================================

  const deleteBill = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bill?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bills/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete bill");
      }

      alert("Bill deleted successfully!");

      if (selectedBill?.id === id) {
        setSelectedBill(null);
      }

      await fetchBills();
    } catch (err) {
      console.error(err);

      alert(
        "Unable to delete this bill. Please check the backend."
      );
    }
  };

  // =====================================================
  // VIEW BILL
  // =====================================================

  const viewBill = (bill) => {
    setSelectedBill(bill);
  };

  // =====================================================
  // CLOSE BILL DETAILS
  // =====================================================

  const closeBillDetails = () => {
    setSelectedBill(null);
  };

  // =====================================================
  // ESC KEY
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedBill(null);
      }
    };

    if (selectedBill) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedBill]);

  // =====================================================
  // OPEN PDF
  // =====================================================

  const openPdf = (id) => {
    window.open(
      `${API_URL}/bills/${id}/pdf`,
      "_blank"
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  // =====================================================
  // GET BILL DATE
  // =====================================================

  const getBillDate = (bill) => {
    return (
      bill?.billDate ||
      bill?.createdAt ||
      bill?.date
    );
  };

  // =====================================================
  // GET MEDICINE NAME
  // =====================================================

  const getMedicineName = (item) => {
    return (
      item?.medicine?.name ||
      item?.medicine?.medicineName ||
      "Unknown Medicine"
    );
  };

  // =====================================================
  // GET MEDICINE DETAILS
  // =====================================================

  const getMedicineDetails = (item) => {
    return (
      item?.medicine?.description ||
      item?.medicine?.category ||
      ""
    );
  };

  // =====================================================
  // GET TOTAL QUANTITY
  // =====================================================

  const getTotalQuantity = (bill) => {
    if (!bill?.items || !Array.isArray(bill.items)) {
      return 0;
    }

    return bill.items.reduce(
      (sum, item) =>
        sum + Number(item?.quantity || 0),
      0
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="billing-history-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        .billing-history-page {
          min-height: 100%;
          width: 100%;
          padding: 28px 34px 40px;
          background:
            radial-gradient(
              circle at 15% 10%,
              rgba(0, 212, 255, 0.07),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #061622 0%,
              #071e2c 52%,
              #061521 100%
            );
          font-family: Inter, Arial, Helvetica, sans-serif;
          color: #e8f7ff;
        }

        .billing-history-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        /* =========================
           HEADER
        ========================= */

        .billing-history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 24px;
          padding: 24px 26px;

          background:
            linear-gradient(
              135deg,
              rgba(8, 43, 59, 0.95),
              rgba(5, 29, 43, 0.96)
            );

          border: 1px solid rgba(0, 214, 255, 0.22);
          border-radius: 18px;

          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.22);
        }

        .billing-history-title h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.15;
          color: #f3fbff;
          font-weight: 800;
        }

        .billing-history-title h1::before {
          content: "🧾";
          display: inline-flex;
          margin-right: 11px;
          filter:
            drop-shadow(
              0 0 8px rgba(0, 229, 255, 0.45)
            );
        }

        .billing-history-title p {
          margin: 8px 0 0;
          color: #8fb7c8;
          font-size: 14px;
        }

        .billing-history-header-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .refresh-button,
        .history-back-button {
          border: 1px solid rgba(0, 214, 255, 0.24);
          border-radius: 10px;
          padding: 11px 16px;
          color: #eafaff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .refresh-button {
          background:
            linear-gradient(
              135deg,
              #087f98,
              #00a9bd
            );
        }

        .refresh-button:hover {
          transform: translateY(-1px);

          background:
            linear-gradient(
              135deg,
              #0796b1,
              #00c4d9
            );
        }

        .refresh-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .history-back-button {
          background: rgba(11, 43, 59, 0.9);
          color: #9dd9e9;
        }

        .history-back-button:hover {
          background: rgba(13, 65, 82, 0.95);
          border-color: rgba(0, 224, 255, 0.42);
        }

        /* =========================
           ERROR
        ========================= */

        .billing-history-error {
          background: rgba(127, 29, 29, 0.25);
          color: #ff8d9b;
          border: 1px solid rgba(255, 92, 112, 0.38);
          border-radius: 12px;
          padding: 13px 16px;
          margin-bottom: 20px;
        }

        /* =========================
           MAIN CARD
        ========================= */

        .billing-history-card {
          background:
            linear-gradient(
              145deg,
              rgba(7, 39, 54, 0.97),
              rgba(5, 29, 43, 0.98)
            );

          border-radius: 18px;
          padding: 22px;

          border: 1px solid rgba(0, 213, 255, 0.20);

          box-shadow:
            0 16px 45px rgba(0, 0, 0, 0.24);

          overflow: hidden;
        }

        .billing-history-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
        }

        .billing-history-card-header h2 {
          margin: 0;
          color: #00e1f5;
          font-size: 21px;
          font-weight: 800;
        }

        .bill-count {
          background: rgba(0, 204, 235, 0.10);
          color: #8eeeff;
          border: 1px solid rgba(0, 214, 255, 0.22);
          border-radius: 20px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 700;
        }

        /* =========================
           TABLE
        ========================= */

        .billing-history-table-container {
          width: 100%;
          overflow-x: auto;

          border: 1px solid rgba(0, 207, 255, 0.16);
          border-radius: 13px;

          background: rgba(3, 24, 36, 0.72);
        }

        .billing-history-table {
          width: 100%;
          min-width: 1450px;
          border-collapse: collapse;
        }

        .billing-history-table thead {
          background:
            linear-gradient(
              180deg,
              rgba(10, 75, 94, 0.85),
              rgba(6, 54, 70, 0.88)
            );
        }

        .billing-history-table th {
          padding: 14px 12px;
          text-align: left;
          color: #a9eaf7;
          font-size: 12px;
          font-weight: 800;
          border-bottom: 1px solid rgba(0, 211, 255, 0.20);
          white-space: nowrap;
        }

        .billing-history-table th:first-child {
          color: #00e7ff;
          text-align: center;
          width: 60px;
        }

        .billing-history-table td {
          padding: 15px 12px;
          border-bottom: 1px solid rgba(120, 190, 210, 0.10);
          color: #c5e1eb;
          font-size: 13px;
          vertical-align: middle;
        }

        .billing-history-table tbody tr {
          transition: background 0.18s ease;
        }

        .billing-history-table tbody tr:hover {
          background: rgba(0, 209, 235, 0.055);
        }

        .billing-history-table tbody tr:last-child td {
          border-bottom: none;
        }

        .serial-number {
          text-align: center;
          color: #00e2f5 !important;
          font-weight: 800;
          font-size: 14px !important;
        }

        .bill-number {
          color: #f1fbff;
          font-weight: 700;
          white-space: nowrap;
        }

        .customer-name {
          color: #e9f8ff;
          font-weight: 700;
        }

        .customer-phone {
          margin-top: 4px;
          color: #759eae;
          font-size: 11px;
        }

        .purchased-medicines {
          min-width: 230px;
        }

        .medicine-item {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 6px;
          padding: 6px 9px;

          background: rgba(0, 199, 225, 0.055);

          border-radius: 8px;
          border: 1px solid rgba(0, 211, 255, 0.13);
        }

        .medicine-item:last-child {
          margin-bottom: 0;
        }

        .medicine-icon {
          font-size: 14px;
        }

        .medicine-name {
          color: #dff8ff;
          font-weight: 600;
        }

        .medicine-quantity {
          color: #00dff4;
          font-weight: 800;
          margin-left: auto;
          white-space: nowrap;
        }

        .no-medicine {
          color: #668b9b;
          font-style: italic;
        }

        .total-amount {
          color: #47e6ad !important;
          font-weight: 800;
        }

        /* =========================
           ACTIONS
        ========================= */

        .billing-actions {
          display: flex;
          gap: 7px;
          align-items: center;
        }

        .view-bill-button,
        .pdf-button,
        .delete-bill-button {
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.18s ease;
        }

        .view-bill-button {
          background: rgba(0, 211, 255, 0.10);
          color: #5eeaff;
          border-color: rgba(0, 211, 255, 0.25);
        }

        .view-bill-button:hover {
          background: rgba(0, 211, 255, 0.19);
          transform: translateY(-1px);
        }

        .pdf-button {
          background: rgba(55, 135, 255, 0.12);
          color: #75b9ff;
          border-color: rgba(55, 135, 255, 0.28);
        }

        .pdf-button:hover {
          background: rgba(55, 135, 255, 0.20);
          transform: translateY(-1px);
        }

        .delete-bill-button {
          background: rgba(255, 71, 98, 0.10);
          color: #ff8497;
          border-color: rgba(255, 71, 98, 0.28);
        }

        .delete-bill-button:hover {
          background: rgba(255, 71, 98, 0.19);
          transform: translateY(-1px);
        }

        /* =========================
           LOADING / EMPTY
        ========================= */

        .billing-history-message {
          padding: 55px 20px;
          text-align: center;
          color: #7fa7b7;
          font-size: 14px;

          background: rgba(2, 22, 33, 0.45);

          border: 1px dashed rgba(0, 210, 240, 0.16);
          border-radius: 12px;
        }

        /* =========================
           MODAL
        ========================= */

        .bill-details-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;

          display: flex;
          justify-content: center;
          align-items: center;

          padding: 25px;

          background: rgba(1, 10, 18, 0.82);

          backdrop-filter: blur(8px);
        }

        .bill-details-modal {
          width: 100%;
          max-width: 900px;
          max-height: 92vh;
          overflow-y: auto;

          background:
            linear-gradient(
              145deg,
              #082536,
              #061a28
            );

          border: 1px solid rgba(0, 218, 255, 0.28);
          border-radius: 18px;

          box-shadow:
            0 25px 80px rgba(0, 0, 0, 0.55);
        }

        .bill-details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding: 20px 24px;

          border-bottom: 1px solid rgba(0, 211, 255, 0.16);

          background:
            linear-gradient(
              135deg,
              rgba(8, 58, 75, 0.92),
              rgba(5, 34, 48, 0.96)
            );
        }

        .bill-details-heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bill-details-icon {
          width: 46px;
          height: 46px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background: rgba(0, 218, 242, 0.11);
          border: 1px solid rgba(0, 218, 242, 0.24);

          font-size: 22px;
        }

        .bill-details-heading h2 {
          margin: 0;
          color: #f1fbff;
          font-size: 22px;
          font-weight: 800;
        }

        .bill-details-heading p {
          margin: 4px 0 0;
          color: #79a8b8;
          font-size: 12px;
        }

        .close-modal-button {
          width: 38px;
          height: 38px;

          border: 1px solid rgba(255, 79, 105, 0.28);
          border-radius: 50%;

          background: rgba(255, 79, 105, 0.09);

          color: #ff8296;

          font-size: 22px;
          font-weight: 700;

          cursor: pointer;
        }

        .close-modal-button:hover {
          background: rgba(255, 79, 105, 0.18);
        }

        .bill-details-content {
          padding: 24px;
        }

        /* BILL INFO */

        .bill-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 11px;
          margin-bottom: 24px;
        }

        .bill-info-box {
          padding: 13px;

          background: rgba(5, 34, 48, 0.85);

          border: 1px solid rgba(0, 211, 255, 0.15);
          border-radius: 10px;
        }

        .bill-info-label {
          margin-bottom: 5px;
          color: #7198a8;
          font-size: 11px;
        }

        .bill-info-value {
          color: #eafaff;
          font-size: 13px;
          font-weight: 800;
        }

        .bill-section-title {
          margin: 0 0 12px;
          color: #00dff4;
          font-size: 17px;
          font-weight: 800;
        }

        /* CUSTOMER */

        .customer-details-box {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;

          padding: 15px;
          margin-bottom: 24px;

          background: rgba(0, 164, 202, 0.06);

          border: 1px solid rgba(0, 211, 255, 0.15);
          border-radius: 11px;
        }

        .customer-detail-item {
          padding: 5px 0;
        }

        .customer-detail-label {
          margin-bottom: 3px;
          color: #668e9e;
          font-size: 10px;
        }

        .customer-detail-value {
          color: #dff8ff;
          font-size: 13px;
          font-weight: 700;
        }

        /* MEDICINE TABLE */

        .bill-items-table-container {
          overflow-x: auto;

          border: 1px solid rgba(0, 211, 255, 0.15);
          border-radius: 10px;

          margin-bottom: 24px;
        }

        .bill-items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .bill-items-table thead {
          background: rgba(7, 68, 87, 0.82);
        }

        .bill-items-table th {
          padding: 12px;

          color: #9edcea;
          text-align: left;

          font-size: 12px;
          font-weight: 800;

          border-bottom: 1px solid rgba(0, 211, 255, 0.16);
        }

        .bill-items-table td {
          padding: 13px 12px;

          border-bottom: 1px solid rgba(120, 190, 210, 0.09);

          font-size: 13px;
          color: #c6e1ea;
        }

        .bill-items-table tbody tr:last-child td {
          border-bottom: none;
        }

        .item-number {
          width: 45px;
          color: #00dff4 !important;
          font-weight: 800;
        }

        .modal-medicine-name {
          color: #e8f8ff;
          font-weight: 700;
        }

        .modal-medicine-detail {
          margin-top: 3px;
          color: #6f99a8;
          font-size: 10px;
        }

        .modal-medicine-quantity {
          color: #00dff4;
          font-weight: 800;
        }

        .modal-item-price {
          color: #a8c6d0;
          font-weight: 600;
        }

        .modal-item-total {
          color: #4de7ae;
          font-weight: 800;
        }

        .no-items-message {
          padding: 30px;
          text-align: center;
          color: #6f98a8;
          font-size: 13px;
        }

        /* SUMMARY */

        .bill-summary-wrapper {
          display: flex;
          justify-content: flex-end;
        }

        .bill-summary {
          width: 100%;
          max-width: 380px;

          padding: 16px;

          background: rgba(4, 28, 41, 0.90);

          border: 1px solid rgba(0, 211, 255, 0.16);
          border-radius: 11px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          padding: 7px 0;

          color: #86aebb;
          font-size: 13px;
        }

        .summary-row strong {
          color: #dff5fc;
        }

        .summary-row.total {
          margin-top: 8px;
          padding-top: 13px;

          border-top: 1px solid rgba(0, 211, 255, 0.14);

          color: #4de7ae;

          font-size: 18px;
          font-weight: 800;
        }

        .summary-row.total strong {
          color: #4de7ae;
        }

        /* MODAL FOOTER */

        .bill-details-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;

          padding: 17px 24px;

          border-top: 1px solid rgba(0, 211, 255, 0.14);

          background: rgba(3, 24, 36, 0.76);
        }

        .modal-pdf-button,
        .modal-close-button {
          border: 1px solid transparent;
          border-radius: 9px;

          padding: 10px 17px;

          font-size: 13px;
          font-weight: 800;

          cursor: pointer;
        }

        .modal-pdf-button {
          background:
            linear-gradient(
              135deg,
              #087f98,
              #00a9bd
            );

          border-color: rgba(0, 229, 255, 0.24);
          color: white;
        }

        .modal-close-button {
          background: rgba(14, 49, 63, 0.92);
          border-color: rgba(0, 211, 255, 0.18);
          color: #b8dce7;
        }

        .modal-close-button:hover {
          background: rgba(18, 70, 87, 0.95);
        }

        /* =========================
           SCROLLBAR
        ========================= */

        .billing-history-page ::-webkit-scrollbar,
        .bill-details-modal::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .billing-history-page ::-webkit-scrollbar-track,
        .bill-details-modal::-webkit-scrollbar-track {
          background: #061824;
        }

        .billing-history-page ::-webkit-scrollbar-thumb,
        .bill-details-modal::-webkit-scrollbar-thumb {
          background: #0b7185;
          border-radius: 20px;
        }

        .billing-history-page ::-webkit-scrollbar-thumb:hover,
        .bill-details-modal::-webkit-scrollbar-thumb:hover {
          background: #00a9bd;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 900px) {
          .billing-history-page {
            padding: 22px 20px 30px;
          }

          .billing-history-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .bill-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .billing-history-page {
            padding: 16px 12px 24px;
          }

          .billing-history-header {
            padding: 19px;
          }

          .billing-history-title h1 {
            font-size: 25px;
          }

          .billing-history-header-buttons {
            width: 100%;
          }

          .refresh-button,
          .history-back-button {
            flex: 1;
          }

          .billing-history-card {
            padding: 14px;
          }

          .bill-details-overlay {
            padding: 8px;
          }

          .bill-details-modal {
            max-height: 96vh;
            border-radius: 12px;
          }

          .bill-details-content {
            padding: 17px;
          }

          .bill-details-header {
            padding: 17px;
          }

          .bill-info-grid,
          .customer-details-box {
            grid-template-columns: 1fr;
          }

          .bill-details-footer {
            flex-direction: column;
            padding: 15px;
          }

          .modal-pdf-button,
          .modal-close-button {
            width: 100%;
          }
        }

      `}</style>

      {/* =====================================================
          BILLING HISTORY PAGE
      ===================================================== */}

      <div className="billing-history-container">

        {/* HEADER */}

        <div className="billing-history-header">

          <div className="billing-history-title">

            <h1>
              Billing History
            </h1>

            <p>
              View all customer bills and invoices
            </p>

          </div>

          <div className="billing-history-header-buttons">

            <button
              className="refresh-button"
              onClick={fetchBills}
              disabled={loading}
            >
              🔄 Refresh
            </button>

            <button
              className="history-back-button"
              onClick={onBack}
            >
              ← Back to Inventory
            </button>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="billing-history-error">
            {error}
          </div>
        )}

        {/* MAIN CARD */}

        <div className="billing-history-card">

          <div className="billing-history-card-header">

            <h2>
              All Bills
            </h2>

            <span className="bill-count">
              {bills.length}{" "}
              {bills.length === 1
                ? "bill"
                : "bills"}
            </span>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="billing-history-message">
              Loading billing history...
            </div>

          ) : bills.length === 0 ? (

            <div className="billing-history-message">
              No bills available yet.
            </div>

          ) : (

            <div className="billing-history-table-container">

              <table className="billing-history-table">

                <thead>

                  <tr>

                    <th>#</th>
                    <th>ID</th>
                    <th>Bill Number</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Medicines Purchased</th>
                    <th>Items</th>
                    <th>Subtotal</th>
                    <th>Discount</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {bills.map((bill, index) => (

                    <tr key={bill.id}>

                      <td className="serial-number">
                        {index + 1}
                      </td>

                      <td>
                        {bill.id}
                      </td>

                      <td>
                        <span className="bill-number">
                          {bill.billNumber || "-"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          getBillDate(bill)
                        )}
                      </td>

                      <td>

                        <div className="customer-name">
                          {bill.customer?.name || "-"}
                        </div>

                        {bill.customer?.phone && (
                          <div className="customer-phone">
                            {bill.customer.phone}
                          </div>
                        )}

                      </td>

                      <td>

                        <div className="purchased-medicines">

                          {bill.items?.length > 0 ? (

                            bill.items.map(
                              (item, itemIndex) => (

                                <div
                                  className="medicine-item"
                                  key={
                                    item.id ||
                                    itemIndex
                                  }
                                >

                                  <span className="medicine-icon">
                                    💊
                                  </span>

                                  <span className="medicine-name">
                                    {getMedicineName(item)}
                                  </span>

                                  <span className="medicine-quantity">
                                    × {item.quantity || 0}
                                  </span>

                                </div>

                              )
                            )

                          ) : (

                            <span className="no-medicine">
                              No medicine details
                            </span>

                          )}

                        </div>

                      </td>

                      <td>
                        {bill.items?.length || 0}
                      </td>

                      <td>
                        {formatCurrency(
                          bill.subtotal
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          bill.discount
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          bill.gst
                        )}
                      </td>

                      <td className="total-amount">
                        {formatCurrency(
                          bill.totalAmount
                        )}
                      </td>

                      <td>

                        <div className="billing-actions">

                          <button
                            className="view-bill-button"
                            onClick={() =>
                              viewBill(bill)
                            }
                          >
                            👁️ View
                          </button>

                          <button
                            className="pdf-button"
                            onClick={() =>
                              openPdf(bill.id)
                            }
                          >
                            📄 PDF
                          </button>

                          <button
                            className="delete-bill-button"
                            onClick={() =>
                              deleteBill(bill.id)
                            }
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          BILL DETAILS MODAL
      ===================================================== */}

      {selectedBill && (

        <div
          className="bill-details-overlay"
          onClick={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeBillDetails();
            }

          }}
        >

          <div className="bill-details-modal">

            {/* MODAL HEADER */}

            <div className="bill-details-header">

              <div className="bill-details-heading">

                <div className="bill-details-icon">
                  🧾
                </div>

                <div>

                  <h2>
                    Bill Details
                  </h2>

                  <p>
                    {selectedBill.billNumber ||
                      "Bill"}
                  </p>

                </div>

              </div>

              <button
                className="close-modal-button"
                onClick={closeBillDetails}
                title="Close"
              >
                ×
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="bill-details-content">

              {/* BILL INFORMATION */}

              <div className="bill-info-grid">

                <div className="bill-info-box">

                  <div className="bill-info-label">
                    Bill Number
                  </div>

                  <div className="bill-info-value">
                    {selectedBill.billNumber || "-"}
                  </div>

                </div>

                <div className="bill-info-box">

                  <div className="bill-info-label">
                    Bill Date
                  </div>

                  <div className="bill-info-value">
                    {formatDate(
                      getBillDate(selectedBill)
                    )}
                  </div>

                </div>

                <div className="bill-info-box">

                  <div className="bill-info-label">
                    Total Items
                  </div>

                  <div className="bill-info-value">
                    {selectedBill.items?.length || 0}
                  </div>

                </div>

                <div className="bill-info-box">

                  <div className="bill-info-label">
                    Total Quantity
                  </div>

                  <div className="bill-info-value">
                    {getTotalQuantity(selectedBill)}
                  </div>

                </div>

              </div>

              {/* CUSTOMER DETAILS */}

              <h3 className="bill-section-title">
                👤 Customer Details
              </h3>

              <div className="customer-details-box">

                <div className="customer-detail-item">

                  <div className="customer-detail-label">
                    NAME
                  </div>

                  <div className="customer-detail-value">
                    {selectedBill.customer?.name || "-"}
                  </div>

                </div>

                <div className="customer-detail-item">

                  <div className="customer-detail-label">
                    PHONE
                  </div>

                  <div className="customer-detail-value">
                    {selectedBill.customer?.phone || "-"}
                  </div>

                </div>

                <div className="customer-detail-item">

                  <div className="customer-detail-label">
                    EMAIL
                  </div>

                  <div className="customer-detail-value">
                    {selectedBill.customer?.email || "-"}
                  </div>

                </div>

                <div className="customer-detail-item">

                  <div className="customer-detail-label">
                    ADDRESS
                  </div>

                  <div className="customer-detail-value">
                    {selectedBill.customer?.address || "-"}
                  </div>

                </div>

              </div>

              {/* MEDICINES */}

              <h3 className="bill-section-title">
                💊 Medicines Purchased
              </h3>

              <div className="bill-items-table-container">

                {selectedBill.items &&
                selectedBill.items.length > 0 ? (

                  <table className="bill-items-table">

                    <thead>

                      <tr>
                        <th>#</th>
                        <th>Medicine</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>

                    </thead>

                    <tbody>

                      {selectedBill.items.map(
                        (item, index) => (

                          <tr
                            key={
                              item.id ||
                              index
                            }
                          >

                            <td className="item-number">
                              {index + 1}
                            </td>

                            <td>

                              <div className="modal-medicine-name">
                                {getMedicineName(item)}
                              </div>

                              {getMedicineDetails(item) && (
                                <div className="modal-medicine-detail">
                                  {getMedicineDetails(item)}
                                </div>
                              )}

                            </td>

                            <td>
                              <span className="modal-medicine-quantity">
                                {item.quantity || 0}
                              </span>
                            </td>

                            <td>
                              <span className="modal-item-price">
                                {formatCurrency(item.price)}
                              </span>
                            </td>

                            <td>
                              <span className="modal-item-total">
                                {formatCurrency(item.total)}
                              </span>
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                ) : (

                  <div className="no-items-message">
                    No medicine details are available
                    for this bill.
                  </div>

                )}

              </div>

              {/* SUMMARY */}

              <div className="bill-summary-wrapper">

                <div className="bill-summary">

                  <div className="summary-row">

                    <span>
                      Subtotal
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBill.subtotal
                      )}
                    </strong>

                  </div>

                  <div className="summary-row">

                    <span>
                      Discount
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBill.discount
                      )}
                    </strong>

                  </div>

                  <div className="summary-row">

                    <span>
                      GST
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBill.gst
                      )}
                    </strong>

                  </div>

                  <div className="summary-row total">

                    <span>
                      Grand Total
                    </span>

                    <strong>
                      {formatCurrency(
                        selectedBill.totalAmount
                      )}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="bill-details-footer">

              <button
                className="modal-pdf-button"
                onClick={() =>
                  openPdf(selectedBill.id)
                }
              >
                📄 View / Download PDF
              </button>

              <button
                className="modal-close-button"
                onClick={closeBillDetails}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default BillingHistory;