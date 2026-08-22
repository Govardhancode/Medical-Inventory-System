package com.medical.inventory.service;

import com.medical.inventory.entity.Medicine;
import com.medical.inventory.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    // =========================
    // ADD MEDICINE
    // =========================

    public Medicine addMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    // =========================
    // GET ALL MEDICINES
    // =========================

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    // =========================
    // GET MEDICINE BY ID
    // =========================

    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepository.findById(id);
    }

    // =========================
    // UPDATE MEDICINE
    // =========================

    public Medicine updateMedicine(Long id, Medicine medicine) {

        Medicine existingMedicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found")
                );

        existingMedicine.setName(medicine.getName());
        existingMedicine.setCategory(medicine.getCategory());
        existingMedicine.setManufacturer(medicine.getManufacturer());
        existingMedicine.setBatchNumber(medicine.getBatchNumber());
        existingMedicine.setQuantity(medicine.getQuantity());
        existingMedicine.setPurchasePrice(medicine.getPurchasePrice());
        existingMedicine.setSellingPrice(medicine.getSellingPrice());
        existingMedicine.setExpiryDate(medicine.getExpiryDate());

        return medicineRepository.save(existingMedicine);
    }

    // =========================
    // DELETE MEDICINE
    // =========================

    public void deleteMedicine(Long id) {
        medicineRepository.deleteById(id);
    }

    // =========================
    // SEARCH MEDICINES
    // =========================

    public List<Medicine> searchMedicines(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name);
    }

    // =========================
    // LOW STOCK MEDICINES
    // =========================

    public List<Medicine> getLowStockMedicines(Integer quantity) {
        return medicineRepository.findByQuantityLessThan(quantity);
    }

    // =========================
    // EXPIRING MEDICINES
    // =========================

    public List<Medicine> getExpiringMedicines(Integer days) {

        LocalDate today = LocalDate.now();
        LocalDate expiryLimit = today.plusDays(days);

        return medicineRepository.findByExpiryDateBetween(
                today,
                expiryLimit
        );
    }

    // =========================
    // UPDATE STOCK
    // =========================

    public Medicine updateStock(Long id, Integer change) {

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found")
                );

        int currentQuantity = medicine.getQuantity();

        int newQuantity = currentQuantity + change;

        // Prevent negative stock
        if (newQuantity < 0) {
            throw new RuntimeException(
                    "Stock quantity cannot be negative"
            );
        }

        medicine.setQuantity(newQuantity);

        return medicineRepository.save(medicine);
    }
}