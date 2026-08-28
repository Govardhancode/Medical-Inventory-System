import { useEffect, useState } from "react";
import "./Billing.css";

const API_URL = "https://medical-inventory-backend-li17.onrender.com/api";

function Billing({ onBack }) {
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // NEW CUSTOMER
  // =====================================================

  const [showCustomerForm, setShowCustomerForm] =
    useState(false);

  const [customerLoading, setCustomerLoading] =
    useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchCustomers();
    fetchMedicines();
  }, []);

  // =====================================================
  // GET CUSTOMERS
  // =====================================================

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${API_URL}/customers`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load customers"
        );
      }

      const data = await response.json();

      setCustomers(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load customers");
    }
  };

  // =====================================================
  // GET MEDICINES
  // =====================================================

  const fetchMedicines = async () => {
    try {
      const response = await fetch(
        `${API_URL}/medicines`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load medicines"
        );
      }

      const data = await response.json();

      setMedicines(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load medicines");
    }
  };

  // =====================================================
  // CUSTOMER FORM INPUT
  // =====================================================

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomerForm({
      ...customerForm,
      [name]: value,
    });
  };

  // =====================================================
  // ADD NEW CUSTOMER
  // =====================================================

  const addCustomer = async (e) => {
    e.preventDefault();

    if (!customerForm.name.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (!customerForm.phone.trim()) {
      alert("Please enter customer phone");
      return;
    }

    try {
      setCustomerLoading(true);

      const response = await fetch(
        `${API_URL}/customers`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: customerForm.name.trim(),
            phone: customerForm.phone.trim(),
            email: customerForm.email.trim(),
            address: customerForm.address.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(errorText);

        throw new Error(
          "Failed to create customer"
        );
      }

      const newCustomer =
        await response.json();

      // Add new customer to dropdown
      setCustomers((currentCustomers) => [
        ...currentCustomers,
        newCustomer,
      ]);

      // Automatically select new customer
      setCustomerId(newCustomer.id);

      // Clear form
      setCustomerForm({
        name: "",
        phone: "",
        email: "",
        address: "",
      });

      // Close popup
      setShowCustomerForm(false);

      alert(
        "Customer added successfully!"
      );

    } catch (error) {
      console.error(error);

      alert(
        "Failed to add customer. Check your backend."
      );
    } finally {
      setCustomerLoading(false);
    }
  };

  // =====================================================
  // SELECTED MEDICINE
  // =====================================================

  const selectedMedicine = medicines.find(
    (medicine) =>
      String(medicine.id) ===
      String(medicineId)
  );

  // =====================================================
  // ADD ITEM
  // =====================================================

  const addItem = () => {
    if (!medicineId) {
      alert("Please select a medicine");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (!selectedMedicine) {
      alert("Medicine not found");
      return;
    }

    const qty = Number(quantity);

    if (
      qty >
      Number(selectedMedicine.quantity)
    ) {
      alert(
        `Only ${selectedMedicine.quantity} units available`
      );

      return;
    }

    const existingItem = items.find(
      (item) =>
        String(item.medicine.id) ===
        String(medicineId)
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + qty;

      if (
        newQuantity >
        Number(selectedMedicine.quantity)
      ) {
        alert(
          `Only ${selectedMedicine.quantity} units available`
        );

        return;
      }

      setItems(
        items.map((item) =>
          String(item.medicine.id) ===
          String(medicineId)
            ? {
                ...item,

                quantity: newQuantity,

                total:
                  Number(item.price) *
                  newQuantity,
              }
            : item
        )
      );

    } else {

      setItems([
        ...items,

        {
          medicine: {
            id: selectedMedicine.id,
          },

          medicineName:
            selectedMedicine.name,

          price: Number(
            selectedMedicine.sellingPrice
          ),

          quantity: qty,

          availableStock: Number(
            selectedMedicine.quantity
          ),

          total:
            Number(
              selectedMedicine.sellingPrice
            ) * qty,
        },
      ]);
    }

    setMedicineId("");
    setQuantity("");
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = (
    medicineIdToUpdate
  ) => {

    setItems((currentItems) =>
      currentItems.map((item) => {

        if (
          String(item.medicine.id) !==
          String(medicineIdToUpdate)
        ) {
          return item;
        }

        const medicine = medicines.find(
          (med) =>
            String(med.id) ===
            String(medicineIdToUpdate)
        );

        if (!medicine) {
          return item;
        }

        const maxStock = Number(
          medicine.quantity
        );

        if (item.quantity >= maxStock) {
          alert(
            `Only ${maxStock} units available`
          );

          return item;
        }

        const newQuantity =
          item.quantity + 1;

        return {
          ...item,

          quantity: newQuantity,

          availableStock: maxStock,

          total:
            Number(item.price) *
            newQuantity,
        };
      })
    );
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = (
    medicineIdToUpdate
  ) => {

    setItems((currentItems) =>
      currentItems.map((item) => {

        if (
          String(item.medicine.id) !==
          String(medicineIdToUpdate)
        ) {
          return item;
        }

        if (item.quantity <= 1) {
          return item;
        }

        const newQuantity =
          item.quantity - 1;

        return {
          ...item,

          quantity: newQuantity,

          total:
            Number(item.price) *
            newQuantity,
        };
      })
    );
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = (
    medicineIdToRemove
  ) => {

    setItems(
      items.filter(
        (item) =>
          String(item.medicine.id) !==
          String(medicineIdToRemove)
      )
    );
  };

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.total),
    0
  );

  const discountAmount =
    Number(discount) || 0;

  const amountAfterDiscount =
    Math.max(
      0,
      subtotal - discountAmount
    );

  const gst =
    amountAfterDiscount * 0.18;

  const totalAmount =
    amountAfterDiscount + gst;

  // =====================================================
  // CREATE BILL
  // =====================================================

  const createBill = async () => {

    if (!customerId) {
      alert("Please select a customer");
      return;
    }

    if (items.length === 0) {
      alert(
        "Please add at least one medicine"
      );

      return;
    }

    if (discountAmount > subtotal) {
      alert(
        "Discount cannot be greater than subtotal"
      );

      return;
    }

    const bill = {
      discount: discountAmount,

      items: items.map((item) => ({
        medicine: {
          id: item.medicine.id,
        },

        quantity: item.quantity,
      })),
    };

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/bills/customer/${customerId}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(bill),
        }
      );

      if (!response.ok) {

        const errorText =
          await response.text();

        console.error(errorText);

        throw new Error(
          "Failed to create bill"
        );
      }

      const savedBill =
        await response.json();

      alert(
        `Bill created successfully!\nBill Number: ${savedBill.billNumber}`
      );

      // Open PDF
      window.open(
        `${API_URL}/bills/${savedBill.id}/pdf`,
        "_blank"
      );

      // Reset
      setCustomerId("");
      setMedicineId("");
      setQuantity("");
      setItems([]);
      setDiscount(0);

      // Refresh stock
      fetchMedicines();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to create bill. Check whether Spring Boot is running."
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="billing-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="billing-header">

        <div>
          <h1>
            Create Bill
          </h1>

          <p>
            Generate customer invoice
          </p>
        </div>

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Inventory
        </button>

      </div>


      {/* =================================================
          CUSTOMER
      ================================================= */}

      <div className="billing-card">

        <div
          className="
            billing-section-header
          "
        >

          <div>
            <h2>
              Customer Details
            </h2>

            <p>
              Select an existing customer
              or create a new one.
            </p>
          </div>

          <button
            type="button"
            className="
              new-customer-button
            "
            onClick={() =>
              setShowCustomerForm(true)
            }
          >
            + New Customer
          </button>

        </div>


        <div className="billing-form-group">

          <label>
            Select Customer
          </label>

          <select
            value={customerId}
            onChange={(e) =>
              setCustomerId(
                e.target.value
              )
            }
          >

            <option value="">
              -- Select Customer --
            </option>

            {customers.map(
              (customer) => (

                <option
                  key={customer.id}
                  value={customer.id}
                >

                  {customer.name}
                  {" - "}
                  {customer.phone}

                </option>

              )
            )}

          </select>

        </div>

      </div>


      {/* =================================================
          NEW CUSTOMER MODAL
      ================================================= */}

      {showCustomerForm && (

        <div
          className="
            customer-modal-overlay
          "
        >

          <div
            className="
              customer-modal
            "
          >

            <div
              className="
                customer-modal-header
              "
            >

              <div>
                <h2>
                  Add New Customer
                </h2>

                <p>
                  Enter customer information
                </p>
              </div>

              <button
                type="button"
                className="
                  modal-close-button
                "
                onClick={() =>
                  setShowCustomerForm(
                    false
                  )
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={addCustomer}
            >

              <div
                className="
                  customer-form-grid
                "
              >

                {/* NAME */}

                <div
                  className="
                    billing-form-group
                  "
                >

                  <label>
                    Customer Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      customerForm.name
                    }
                    onChange={
                      handleCustomerChange
                    }
                    placeholder="
                      Enter customer name
                    "
                    required
                  />

                </div>


                {/* PHONE */}

                <div
                  className="
                    billing-form-group
                  "
                >

                  <label>
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      customerForm.phone
                    }
                    onChange={
                      handleCustomerChange
                    }
                    placeholder="
                      Enter phone number
                    "
                    required
                  />

                </div>


                {/* EMAIL */}

                <div
                  className="
                    billing-form-group
                  "
                >

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      customerForm.email
                    }
                    onChange={
                      handleCustomerChange
                    }
                    placeholder="
                      Enter email
                    "
                  />

                </div>


                {/* ADDRESS */}

                <div
                  className="
                    billing-form-group
                    customer-address-field
                  "
                >

                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      customerForm.address
                    }
                    onChange={
                      handleCustomerChange
                    }
                    placeholder="
                      Enter customer address
                    "
                    rows="3"
                  />

                </div>

              </div>


              {/* BUTTONS */}

              <div
                className="
                  customer-form-buttons
                "
              >

                <button
                  type="button"
                  className="
                    cancel-customer-button
                  "
                  onClick={() =>
                    setShowCustomerForm(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    save-customer-button
                  "
                  disabled={
                    customerLoading
                  }
                >

                  {customerLoading
                    ? "Saving..."
                    : "Save Customer"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =================================================
          MEDICINE
      ================================================= */}

      <div className="billing-card">

        <h2>
          Add Medicine
        </h2>

        <div className="medicine-row">

          <div
            className="
              billing-form-group
            "
          >

            <label>
              Medicine
            </label>

            <select
              value={medicineId}
              onChange={(e) =>
                setMedicineId(
                  e.target.value
                )
              }
            >

              <option value="">
                -- Select Medicine --
              </option>

              {medicines.map(
                (medicine) => (

                  <option
                    key={medicine.id}
                    value={medicine.id}
                    disabled={
                      medicine.quantity <= 0
                    }
                  >

                    {medicine.name}
                    {" - ₹"}
                    {
                      medicine.sellingPrice
                    }
                    {" - Stock: "}
                    {
                      medicine.quantity
                    }

                  </option>

                )
              )}

            </select>

          </div>


          <div
            className="
              billing-form-group
              quantity-input
            "
          >

            <label>
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              placeholder="Quantity"
            />

          </div>


          <button
            className="
              add-item-button
            "
            onClick={addItem}
          >
            + Add Item
          </button>

        </div>

      </div>


      {/* =================================================
          BILL ITEMS
      ================================================= */}

      <div className="billing-card">

        <h2>
          Bill Items
        </h2>

        {items.length === 0 ? (

          <div className="empty-bill">
            No medicines added yet.
          </div>

        ) : (

          <div
            className="
              bill-table-container
            "
          >

            <table className="bill-table">

              <thead>

                <tr>

                  <th>
                    Medicine
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map(
                  (item) => {

                    const medicine =
                      medicines.find(
                        (med) =>
                          String(
                            med.id
                          ) ===
                          String(
                            item.medicine.id
                          )
                      );

                    const availableStock =
                      medicine
                        ? Number(
                            medicine.quantity
                          )
                        : Number(
                            item.availableStock
                          );

                    return (

                      <tr
                        key={
                          item.medicine.id
                        }
                      >

                        <td>

                          <strong>
                            {
                              item.medicineName
                            }
                          </strong>

                          <div
                            className="
                              stock-info
                              stock-valid
                            "
                          >
                            ✓ In Stock
                          </div>

                        </td>


                        <td>
                          ₹
                          {Number(
                            item.price
                          ).toFixed(2)}
                        </td>


                        <td>

                          <div
                            className="
                              quantity-control
                            "
                          >

                            <button
                              type="button"
                              className="
                                quantity-button
                              "
                              onClick={() =>
                                decreaseQuantity(
                                  item.medicine.id
                                )
                              }
                              disabled={
                                item.quantity <= 1
                              }
                            >
                              −
                            </button>


                            <span
                              className="
                                quantity-value
                              "
                            >
                              {
                                item.quantity
                              }
                            </span>


                            <button
                              type="button"
                              className="
                                quantity-button
                              "
                              onClick={() =>
                                increaseQuantity(
                                  item.medicine.id
                                )
                              }
                              disabled={
                                item.quantity >=
                                availableStock
                              }
                            >
                              +
                            </button>

                          </div>

                          <div
                            className="
                              stock-info
                            "
                          >
                            Available:{" "}
                            {
                              availableStock
                            }
                          </div>

                        </td>


                        <td>

                          <strong>
                            ₹
                            {Number(
                              item.total
                            ).toFixed(2)}
                          </strong>

                        </td>


                        <td>

                          <button
                            className="
                              remove-button
                            "
                            onClick={() =>
                              removeItem(
                                item.medicine.id
                              )
                            }
                          >
                            Remove
                          </button>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div
        className="
          billing-summary
        "
      >

        <div
          className="
            summary-row
          "
        >

          <span>
            Subtotal
          </span>

          <strong>
            ₹
            {subtotal.toFixed(2)}
          </strong>

        </div>


        <div
          className="
            summary-row
          "
        >

          <span>
            Discount
          </span>

          <input
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={(e) =>
              setDiscount(
                e.target.value
              )
            }
          />

        </div>


        <div
          className="
            summary-row
          "
        >

          <span>
            GST (18%)
          </span>

          <strong>
            ₹
            {gst.toFixed(2)}
          </strong>

        </div>


        <div
          className="
            summary-divider
          "
        ></div>


        <div
          className="
            summary-total
          "
        >

          <span>
            Total Amount
          </span>

          <strong>
            ₹
            {totalAmount.toFixed(2)}
          </strong>

        </div>


        <button
          className="
            create-bill-button
          "
          onClick={createBill}
          disabled={loading}
        >

          {loading
            ? "Creating Bill..."
            : "Create Bill & Generate PDF"}

        </button>

      </div>

    </div>
  );
}

export default Billing;
