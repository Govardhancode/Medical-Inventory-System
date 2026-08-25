import { useEffect, useState } from "react";
import "./Supplier.css";

const API_URL = "https://medical-inventory-backend-li17.onrender.com/api";

function SupplierManagement({ onBack }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });

  // ================================
  // FETCH SUPPLIERS
  // ================================

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/suppliers`);

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const data = await response.json();

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Supplier fetch error:", error);
      setError("Unable to connect to supplier backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ================================
  // FORM CHANGE
  // ================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================================
  // RESET FORM
  // ================================

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
    });

    setEditingSupplier(null);
  };

  // ================================
  // OPEN ADD FORM
  // ================================

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  // ================================
  // OPEN EDIT FORM
  // ================================

  const openEditForm = (supplier) => {
    setEditingSupplier(supplier);

    setFormData({
      name: supplier.name || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });

    setShowForm(true);
  };

  // ================================
  // CLOSE FORM
  // ================================

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  // ================================
  // SAVE SUPPLIER
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const supplier = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      };

      let response;

      if (editingSupplier) {
        response = await fetch(
          `${API_URL}/suppliers/${editingSupplier.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(supplier),
          }
        );
      } else {
        response = await fetch(`${API_URL}/suppliers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplier),
        });
      }

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to save supplier"
        );
      }

      alert(
        editingSupplier
          ? "Supplier updated successfully!"
          : "Supplier added successfully!"
      );

      closeForm();
      fetchSuppliers();
    } catch (error) {
      console.error("Supplier save error:", error);

      alert(
        error.message || "Failed to save supplier"
      );
    }
  };

  // ================================
  // DELETE SUPPLIER
  // ================================

  const deleteSupplier = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/suppliers/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to delete supplier"
        );
      }

      alert("Supplier deleted successfully!");

      fetchSuppliers();
    } catch (error) {
      console.error("Delete supplier error:", error);

      alert(
        error.message ||
          "Unable to delete supplier."
      );
    }
  };

  // ================================
  // SEARCH
  // ================================

  const filteredSuppliers = suppliers.filter(
    (supplier) => {
      const searchText = search
        .toLowerCase()
        .trim();

      return (
        supplier.name
          ?.toLowerCase()
          .includes(searchText) ||
        supplier.contactPerson
          ?.toLowerCase()
          .includes(searchText) ||
        supplier.phone
          ?.toLowerCase()
          .includes(searchText) ||
        supplier.email
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  // ================================
  // PAGE
  // ================================

  return (
    <div className="supplier-page">

      {/* HEADER */}

      <div className="supplier-header">

        <div>
          <h1>Supplier Management</h1>

          <p>
            Manage your medical suppliers
            and supplier information
          </p>
        </div>

        <button
          className="supplier-back-button"
          onClick={onBack}
        >
          ← Back
        </button>

      </div>

      {/* ACTION BAR */}

      <div className="supplier-toolbar">

        <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="supplier-search"
        />

        <button
          className="supplier-refresh"
          onClick={fetchSuppliers}
        >
          🔄 Refresh
        </button>

        <button
          className="supplier-add"
          onClick={openAddForm}
        >
          + Add Supplier
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="supplier-error">
          {error}
        </div>
      )}

      {/* FORM */}

      {showForm && (
        <div className="supplier-form-container">

          <div className="supplier-form-header">

            <h2>
              {editingSupplier
                ? "Edit Supplier"
                : "Add New Supplier"}
            </h2>

            <button
              className="supplier-close"
              onClick={closeForm}
            >
              ✕
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="supplier-form-grid">

              <div className="supplier-form-group">

                <label>
                  Supplier Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  required
                />

              </div>

              <div className="supplier-form-group">

                <label>
                  Contact Person
                </label>

                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Enter contact person"
                  required
                />

              </div>

              <div className="supplier-form-group">

                <label>
                  Phone
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

              <div className="supplier-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />

              </div>

              <div className="supplier-form-group full-width">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter supplier address"
                  rows="3"
                />

              </div>

            </div>

            <div className="supplier-form-buttons">

              <button
                type="button"
                className="supplier-cancel"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="supplier-save"
              >
                {editingSupplier
                  ? "Update Supplier"
                  : "Save Supplier"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* TABLE */}

      <div className="supplier-table-container">

        {loading ? (
          <p className="supplier-message">
            Loading suppliers...
          </p>
        ) : filteredSuppliers.length === 0 ? (
          <p className="supplier-message">
            {search
              ? "No suppliers found."
              : "No suppliers available."}
          </p>
        ) : (
          <table className="supplier-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredSuppliers.map(
                (supplier) => (
                  <tr key={supplier.id}>

                    <td>
                      {supplier.id}
                    </td>

                    <td>
                      <strong>
                        {supplier.name}
                      </strong>
                    </td>

                    <td>
                      {supplier.contactPerson}
                    </td>

                    <td>
                      {supplier.phone}
                    </td>

                    <td>
                      {supplier.email}
                    </td>

                    <td>
                      {supplier.address}
                    </td>

                    <td>

                      <div className="supplier-actions">

                        <button
                          className="supplier-edit"
                          onClick={() =>
                            openEditForm(
                              supplier
                            )
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="supplier-delete"
                          onClick={() =>
                            deleteSupplier(
                              supplier.id
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
        )}

      </div>

    </div>
  );
}

export default SupplierManagement;