package com.medical.inventory.service;

import com.medical.inventory.entity.Bill;
import com.medical.inventory.entity.BillItem;
import com.medical.inventory.entity.Customer;
import com.medical.inventory.entity.Medicine;
import com.medical.inventory.repository.BillRepository;
import com.medical.inventory.repository.CustomerRepository;
import com.medical.inventory.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final MedicineRepository medicineRepository;

    public BillService(
            BillRepository billRepository,
            CustomerRepository customerRepository,
            MedicineRepository medicineRepository) {

        this.billRepository = billRepository;
        this.customerRepository = customerRepository;
        this.medicineRepository = medicineRepository;
    }

    // Create Bill
    public Bill createBill(Long customerId, Bill bill) {

        // Find customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        bill.setCustomer(customer);
        bill.setBillDate(LocalDateTime.now());

        // Generate bill number
        bill.setBillNumber(
                "BILL-" + System.currentTimeMillis()
        );

        double subtotal = 0;

        // Process every bill item
        for (BillItem item : bill.getItems()) {

            Long medicineId = item.getMedicine().getId();

            Medicine medicine = medicineRepository.findById(medicineId)
                    .orElseThrow(() ->
                            new RuntimeException("Medicine not found"));

            Integer quantity = item.getQuantity();

            // Check quantity
            if (quantity == null || quantity <= 0) {
                throw new RuntimeException(
                        "Quantity must be greater than 0");
            }

            // Check stock
            if (medicine.getQuantity() < quantity) {
                throw new RuntimeException(
                        "Insufficient stock for "
                                + medicine.getName());
            }

            // Get selling price from database
            double price = medicine.getSellingPrice();

            double itemTotal = price * quantity;

            item.setMedicine(medicine);
            item.setBill(bill);
            item.setPrice(price);
            item.setTotal(itemTotal);

            subtotal += itemTotal;

            // Reduce stock
            medicine.setQuantity(
                    medicine.getQuantity() - quantity);

            medicineRepository.save(medicine);
        }

        // Set subtotal
        bill.setSubtotal(subtotal);

        // Discount
        double discount = bill.getDiscount() == null
                ? 0
                : bill.getDiscount();

        bill.setDiscount(discount);

        // Amount after discount
        double amountAfterDiscount =
                subtotal - discount;

        // GST 18%
        double gst =
                amountAfterDiscount * 0.18;

        bill.setGst(gst);

        // Final amount
        double totalAmount =
                amountAfterDiscount + gst;

        bill.setTotalAmount(totalAmount);

        return billRepository.save(bill);
    }

    // Get all bills
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    // Get bill by ID
    public Bill getBillById(Long id) {

        return billRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Bill not found"));
    }

    // Delete bill
    public void deleteBill(Long id) {

        if (!billRepository.existsById(id)) {
            throw new RuntimeException("Bill not found");
        }

        billRepository.deleteById(id);
    }
}