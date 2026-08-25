import { useEffect, useMemo, useState } from "react";

const API_URL = "https://medical-inventory-system-vtbs.onrender.com/api";

function CustomerManagement({ onBack }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/customers`);

      if (!response.ok) {
        throw new Error("Failed to load customers");
      }

      const data = await response.json();

      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Customer loading error:", err);

      setError(
        "Unable to load customers. Make sure the Spring Boot backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORM
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
    });

    setEditingCustomer(null);
  };

  const openEditForm = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // ADD / UPDATE CUSTOMER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter customer phone");
      return;
    }

    try {
      setSaving(true);

      const customer = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      };

      let response;

      if (editingCustomer) {
        response = await fetch(
          `${API_URL}/customers/${editingCustomer.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(customer),
          }
        );
      } else {
        response = await fetch(`${API_URL}/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customer),
        });
      }

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to save customer"
        );
      }

      alert(
        editingCustomer
          ? "Customer updated successfully!"
          : "Customer added successfully!"
      );

      resetForm();

      await fetchCustomers();
    } catch (err) {
      console.error("Save customer error:", err);

      alert(
        err.message ||
          (editingCustomer
            ? "Failed to update customer"
            : "Failed to add customer")
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE CUSTOMER
  // =====================================================

  const deleteCustomer = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to delete customer"
        );
      }

      alert("Customer deleted successfully!");

      await fetchCustomers();

      if (editingCustomer?.id === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Delete customer error:", err);

      alert(
        "Cannot delete this customer. The customer may already be linked to a bill."
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredCustomers = useMemo(() => {
    const text = search.toLowerCase().trim();

    if (!text) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name
          ?.toLowerCase()
          .includes(text) ||
        customer.phone
          ?.toLowerCase()
          .includes(text) ||
        customer.email
          ?.toLowerCase()
          .includes(text) ||
        customer.address
          ?.toLowerCase()
          .includes(text)
      );
    });
  }, [customers, search]);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="customer-page">

      <style>{`

        /* =====================================================
           GLOBAL
        ===================================================== */

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          background: #031525;
        }

        /* =====================================================
           MAIN PAGE
        ===================================================== */

        .customer-page {
          width: 100%;
          min-height: 100vh;

          padding: 25px;

          background:
            linear-gradient(
              135deg,
              #031525 0%,
              #061f33 45%,
              #041a2c 100%
            );

          color: #f1f7ff;
        }

        .customer-container {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .customer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 20px;

          margin-bottom: 25px;

          padding: 22px 25px;

          background:
            linear-gradient(
              135deg,
              rgba(8, 35, 56, 0.96),
              rgba(4, 27, 45, 0.96)
            );

          border: 1px solid
            rgba(0, 229, 255, 0.15);

          border-radius: 14px;

          box-shadow:
            0 12px 35px
            rgba(0, 0, 0, 0.25);
        }

        .customer-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .customer-icon {
          width: 56px;
          height: 56px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            rgba(0, 229, 255, 0.08);

          border:
            1px solid
            rgba(0, 229, 255, 0.25);

          border-radius: 14px;

          color: #00e5ff;

          font-size: 27px;

          box-shadow:
            0 0 20px
            rgba(0, 229, 255, 0.05);
        }

        .customer-title h1 {
          margin: 0;

          color: #f1f7ff;

          font-size: 28px;

          font-weight: 800;

          letter-spacing: -0.5px;
        }

        .customer-title p {
          margin: 7px 0 0;

          color: #8da6bb;

          font-size: 14px;
        }

        /* =====================================================
           BACK BUTTON
        ===================================================== */

        .back-button {
          border:
            1px solid
            rgba(0, 229, 255, 0.25);

          background:
            rgba(0, 229, 255, 0.07);

          color: #00e5ff;

          padding: 11px 18px;

          border-radius: 9px;

          font-size: 14px;

          font-weight: 700;

          cursor: pointer;

          transition:
            all 0.2s ease;
        }

        .back-button:hover {
          background:
            rgba(0, 229, 255, 0.14);

          border-color: #00e5ff;

          transform: translateY(-1px);
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .customer-error {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-bottom: 20px;

          padding: 14px 17px;

          border:
            1px solid
            rgba(239, 68, 68, 0.25);

          border-radius: 10px;

          background:
            rgba(127, 29, 29, 0.20);

          color: #ff7b82;

          font-size: 13px;

          font-weight: 600;
        }

        /* =====================================================
           CARD
        ===================================================== */

        .customer-card {
          margin-bottom: 22px;

          padding: 24px;

          background:
            linear-gradient(
              135deg,
              rgba(8, 35, 56, 0.96),
              rgba(4, 27, 45, 0.96)
            );

          border:
            1px solid
            rgba(0, 229, 255, 0.14);

          border-radius: 14px;

          box-shadow:
            0 12px 35px
            rgba(0, 0, 0, 0.22);
        }

        /* =====================================================
           CARD HEADER
        ===================================================== */

        .customer-card-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 22px;
        }

        .customer-card-title {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .customer-card-title-icon {
          width: 42px;
          height: 42px;

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            rgba(0, 229, 255, 0.08);

          border:
            1px solid
            rgba(0, 229, 255, 0.16);

          color: #00e5ff;

          border-radius: 10px;

          font-size: 19px;
        }

        .customer-card h2 {
          margin: 0;

          color: #f1f7ff;

          font-size: 19px;

          font-weight: 700;
        }

        .customer-card-subtitle {
          margin: 5px 0 0;

          color: #7f98aa;

          font-size: 13px;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .customer-form {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 18px;
        }

        .customer-form-group {
          display: flex;

          flex-direction: column;

          gap: 7px;
        }

        .customer-form-group.full-width {
          grid-column: 1 / -1;
        }

        .customer-form-group label {
          color: #9bb2c5;

          font-size: 12px;

          font-weight: 700;
        }

        .customer-form-group input,
        .customer-form-group textarea {
          width: 100%;

          border:
            1px solid
            rgba(0, 229, 255, 0.18);

          background:
            rgba(3, 21, 37, 0.85);

          color: #f1f7ff;

          border-radius: 8px;

          padding: 12px 13px;

          font-size: 13px;

          outline: none;

          font-family: inherit;

          transition:
            all 0.2s ease;
        }

        .customer-form-group input {
          height: 44px;
        }

        .customer-form-group textarea {
          min-height: 90px;

          resize: vertical;
        }

        .customer-form-group input::placeholder,
        .customer-form-group textarea::placeholder {
          color: #61798c;
        }

        .customer-form-group input:focus,
        .customer-form-group textarea:focus {
          border-color: #00e5ff;

          background:
            rgba(3, 21, 37, 0.95);

          box-shadow:
            0 0 14px
            rgba(0, 229, 255, 0.09);
        }

        /* =====================================================
           FORM BUTTONS
        ===================================================== */

        .customer-form-buttons {
          grid-column: 1 / -1;

          display: flex;

          justify-content: flex-end;

          gap: 10px;

          margin-top: 4px;

          padding-top: 18px;

          border-top:
            1px solid
            rgba(0, 229, 255, 0.10);
        }

        .customer-cancel-button,
        .customer-save-button {
          height: 42px;

          padding: 0 19px;

          border-radius: 8px;

          font-size: 13px;

          font-weight: 700;

          cursor: pointer;

          transition:
            all 0.2s ease;
        }

        .customer-cancel-button {
          border:
            1px solid
            rgba(255, 255, 255, 0.12);

          background:
            rgba(255, 255, 255, 0.05);

          color: #9eb1c0;
        }

        .customer-cancel-button:hover {
          background:
            rgba(255, 255, 255, 0.09);

          color: #ffffff;
        }

        .customer-save-button {
          border: none;

          background:
            linear-gradient(
              135deg,
              #00c9b7,
              #1479ff
            );

          color: white;

          box-shadow:
            0 8px 20px
            rgba(0, 201, 183, 0.15);
        }

        .customer-save-button:hover {
          transform: translateY(-1px);

          box-shadow:
            0 10px 25px
            rgba(0, 201, 183, 0.25);
        }

        .customer-save-button:disabled,
        .customer-cancel-button:disabled {
          opacity: 0.55;

          cursor: not-allowed;

          transform: none;
        }

        /* =====================================================
           TOOLBAR
        ===================================================== */

        .customer-toolbar {
          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 14px;

          margin-bottom: 20px;
        }

        .customer-search-wrapper {
          position: relative;

          flex: 1;

          max-width: 650px;
        }

        .customer-search-icon {
          position: absolute;

          left: 15px;

          top: 50%;

          transform:
            translateY(-50%);

          color: #00e5ff;

          font-size: 15px;

          pointer-events: none;
        }

        .customer-search {
          width: 100%;

          height: 44px;

          border:
            1px solid
            rgba(0, 229, 255, 0.20);

          background:
            rgba(3, 21, 37, 0.80);

          border-radius: 9px;

          padding:
            0 15px 0 43px;

          color: #f1f7ff;

          font-size: 13px;

          outline: none;

          transition:
            all 0.2s ease;
        }

        .customer-search::placeholder {
          color: #688399;
        }

        .customer-search:focus {
          border-color: #00e5ff;

          background:
            rgba(3, 21, 37, 0.95);

          box-shadow:
            0 0 15px
            rgba(0, 229, 255, 0.10);
        }

        .customer-count {
          background:
            rgba(0, 229, 255, 0.08);

          border:
            1px solid
            rgba(0, 229, 255, 0.16);

          color: #8edee9;

          padding: 8px 14px;

          border-radius: 20px;

          font-size: 12px;

          font-weight: 700;

          white-space: nowrap;
        }

        /* =====================================================
           REFRESH
        ===================================================== */

        .refresh-customer-button {
          height: 42px;

          border:
            1px solid
            rgba(0, 229, 255, 0.22);

          background:
            rgba(0, 229, 255, 0.07);

          color: #00e5ff;

          padding: 0 15px;

          border-radius: 9px;

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;

          transition:
            all 0.2s ease;
        }

        .refresh-customer-button:hover {
          background:
            rgba(0, 229, 255, 0.14);

          border-color: #00e5ff;

          transform: translateY(-1px);
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .customer-table-container {
          width: 100%;

          overflow-x: auto;

          border:
            1px solid
            rgba(0, 229, 255, 0.13);

          border-radius: 11px;
        }

        .customer-table {
          width: 100%;

          min-width: 950px;

          border-collapse: collapse;
        }

        .customer-table thead {
          background:
            rgba(0, 229, 255, 0.055);
        }

        .customer-table th {
          padding: 15px 16px;

          text-align: left;

          color: #8edee9;

          font-size: 11px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.6px;

          border-bottom:
            1px solid
            rgba(0, 229, 255, 0.13);

          white-space: nowrap;
        }

        .customer-table td {
          padding: 15px 16px;

          color: #c7d6e2;

          font-size: 13px;

          border-bottom:
            1px solid
            rgba(255, 255, 255, 0.055);

          vertical-align: middle;
        }

        .customer-table tbody tr {
          transition:
            background 0.2s ease;
        }

        .customer-table tbody tr:hover {
          background:
            rgba(0, 229, 255, 0.045);
        }

        .customer-table tbody tr:last-child td {
          border-bottom: none;
        }

        .customer-table td strong {
          color: #f1f7ff;

          font-size: 14px;
        }

        /* =====================================================
           CUSTOMER ID
        ===================================================== */

        .customer-id {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          min-width: 35px;

          height: 28px;

          padding: 0 8px;

          border:
            1px solid
            rgba(0, 229, 255, 0.14);

          border-radius: 7px;

          background:
            rgba(0, 229, 255, 0.07);

          color: #00e5ff;

          font-size: 11px;

          font-weight: 800;
        }

        .customer-phone {
          color: #a9c0cf;
        }

        .customer-email {
          color: #9db5c5;
        }

        .customer-address {
          max-width: 240px;

          white-space: normal;

          line-height: 1.4;

          color: #9db5c5;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .customer-actions {
          display: flex;

          align-items: center;

          gap: 7px;

          white-space: nowrap;
        }

        .edit-customer-button,
        .delete-customer-button {
          border-radius: 7px;

          padding: 7px 10px;

          font-size: 11px;

          font-weight: 700;

          cursor: pointer;

          transition:
            all 0.2s ease;
        }

        .edit-customer-button {
          border:
            1px solid
            rgba(0, 229, 255, 0.18);

          background:
            rgba(0, 229, 255, 0.07);

          color: #00e5ff;
        }

        .edit-customer-button:hover {
          background:
            rgba(0, 229, 255, 0.14);

          border-color: #00e5ff;

          transform: translateY(-1px);
        }

        .delete-customer-button {
          border:
            1px solid
            rgba(239, 68, 68, 0.18);

          background:
            rgba(239, 68, 68, 0.07);

          color: #ff6b73;
        }

        .delete-customer-button:hover {
          background:
            rgba(239, 68, 68, 0.14);

          border-color: #ef4444;

          transform: translateY(-1px);
        }

        /* =====================================================
           LOADING / EMPTY
        ===================================================== */

        .customer-message {
          padding: 55px 25px;

          text-align: center;

          color: #7f98aa;

          font-size: 14px;
        }

        .customer-message-icon {
          width: 58px;

          height: 58px;

          margin:
            0 auto 14px;

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            rgba(0, 229, 255, 0.07);

          border:
            1px solid
            rgba(0, 229, 255, 0.15);

          color: #00e5ff;

          border-radius: 50%;

          font-size: 24px;
        }

        /* =====================================================
           SCROLLBAR
        ===================================================== */

        .customer-table-container::-webkit-scrollbar {
          height: 7px;
        }

        .customer-table-container::-webkit-scrollbar-track {
          background: #031525;
        }

        .customer-table-container::-webkit-scrollbar-thumb {
          background:
            rgba(0, 229, 255, 0.25);

          border-radius: 10px;
        }

        .customer-table-container::-webkit-scrollbar-thumb:hover {
          background:
            rgba(0, 229, 255, 0.45);
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 850px) {

          .customer-page {
            padding: 18px;
          }

          .customer-header {
            flex-direction: column;

            align-items: flex-start;
          }

          .back-button {
            width: 100%;
          }

          .customer-form {
            grid-template-columns: 1fr;
          }

          .customer-form-group.full-width,
          .customer-form-buttons {
            grid-column: auto;
          }

          .customer-toolbar {
            flex-direction: column;

            align-items: stretch;
          }

          .customer-search-wrapper {
            max-width: none;
          }

          .customer-count {
            align-self: flex-start;
          }

          .refresh-customer-button {
            width: 100%;
          }
        }

        @media (max-width: 500px) {

          .customer-page {
            padding: 10px;
          }

          .customer-title {
            align-items: flex-start;
          }

          .customer-title h1 {
            font-size: 22px;
          }

          .customer-title p {
            font-size: 12px;
          }

          .customer-icon {
            width: 48px;
            height: 48px;
            font-size: 22px;
          }

          .customer-card {
            padding: 16px;
          }

          .customer-form-buttons {
            flex-direction: column;
          }

          .customer-cancel-button,
          .customer-save-button {
            width: 100%;
          }
        }

      `}</style>

      <div className="customer-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="customer-header">

          <div className="customer-title">

            <div className="customer-icon">
              👥
            </div>

            <div>

              <h1>
                Customer Management
              </h1>

              <p>
                Manage patient and customer information
                securely and efficiently
              </p>

            </div>

          </div>

          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back to Inventory
          </button>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="customer-error">
            ⚠️
            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            ADD / EDIT CUSTOMER
        ===================================================== */}

        <div className="customer-card">

          <div className="customer-card-header">

            <div className="customer-card-title">

              <div className="customer-card-title-icon">
                {editingCustomer ? "✏️" : "➕"}
              </div>

              <div>

                <h2>
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add New Customer"}
                </h2>

                <p className="customer-card-subtitle">
                  {editingCustomer
                    ? "Update the customer information below"
                    : "Enter customer details to add a new record"}
                </p>

              </div>

            </div>

          </div>

          <form
            className="customer-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="customer-form-group">

              <label>
                Customer Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />

            </div>

            {/* PHONE */}

            <div className="customer-form-group">

              <label>
                Phone Number *
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />

            </div>

            {/* EMAIL */}

            <div className="customer-form-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />

            </div>

            {/* ADDRESS */}

            <div className="customer-form-group">

              <label>
                Address
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter customer address"
              />

            </div>

            {/* BUTTONS */}

            <div className="customer-form-buttons">

              {editingCustomer && (
                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="customer-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingCustomer
                    ? "✓ Update Customer"
                    : "＋ Save Customer"}
              </button>

            </div>

          </form>

        </div>

        {/* =====================================================
            CUSTOMER LIST
        ===================================================== */}

        <div className="customer-card">

          <div className="customer-toolbar">

            <div className="customer-search-wrapper">

              <span className="customer-search-icon">
                🔍
              </span>

              <input
                type="text"
                className="customer-search"
                placeholder="Search by name, phone, email or address..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            <span className="customer-count">
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1
                ? "s"
                : ""}
            </span>

            <button
              type="button"
              className="refresh-customer-button"
              onClick={fetchCustomers}
            >
              🔄 Refresh
            </button>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="customer-message">

              <div className="customer-message-icon">
                👥
              </div>

              Loading customers...

            </div>

          ) : filteredCustomers.length === 0 ? (

            /* EMPTY */

            <div className="customer-message">

              <div className="customer-message-icon">
                {search ? "🔍" : "👤"}
              </div>

              <div>
                {search
                  ? "No customers found."
                  : "No customers available. Add your first customer above."}
              </div>

            </div>

          ) : (

            /* TABLE */

            <div className="customer-table-container">

              <table className="customer-table">

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredCustomers.map(
                    (customer) => (

                      <tr key={customer.id}>

                        <td>

                          <span className="customer-id">
                            #{customer.id}
                          </span>

                        </td>

                        <td>

                          <strong>
                            {customer.name}
                          </strong>

                        </td>

                        <td className="customer-phone">
                          {customer.phone || "-"}
                        </td>

                        <td className="customer-email">
                          {customer.email || "-"}
                        </td>

                        <td className="customer-address">
                          {customer.address || "-"}
                        </td>

                        <td>

                          <div className="customer-actions">

                            <button
                              type="button"
                              className="edit-customer-button"
                              onClick={() =>
                                openEditForm(customer)
                              }
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              className="delete-customer-button"
                              onClick={() =>
                                deleteCustomer(
                                  customer.id
                                )
                              }
                            >
                              🗑️ Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default CustomerManagement;