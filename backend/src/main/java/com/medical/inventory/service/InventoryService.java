package com.medical.inventory.service;

import com.medical.inventory.entity.Inventory;
import com.medical.inventory.entity.Medicine;
import com.medical.inventory.repository.InventoryRepository;
import com.medical.inventory.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MedicineRepository medicineRepository;

    public InventoryService(
            InventoryRepository inventoryRepository,
            MedicineRepository medicineRepository) {

        this.inventoryRepository = inventoryRepository;
        this.medicineRepository = medicineRepository;
    }

    // Create inventory record
    public Inventory createInventory(
            Long medicineId,
            Inventory inventory) {

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        inventory.setMedicine(medicine);

        return inventoryRepository.save(inventory);
    }

    // Get all inventory
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    // Get inventory by ID
    public Optional<Inventory> getInventoryById(Long id) {
        return inventoryRepository.findById(id);
    }

    // Get inventory by medicine
    public Optional<Inventory> getInventoryByMedicineId(Long medicineId) {
        return inventoryRepository.findByMedicineId(medicineId);
    }

    // Update inventory
    public Inventory updateInventory(
            Long id,
            Inventory inventory) {

        Inventory existingInventory =
                inventoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Inventory not found"));

        existingInventory.setMinimumStockLevel(
                inventory.getMinimumStockLevel());

        existingInventory.setStorageLocation(
                inventory.getStorageLocation());

        return inventoryRepository.save(existingInventory);
    }

    // Delete inventory
    public void deleteInventory(Long id) {

        if (!inventoryRepository.existsById(id)) {
            throw new RuntimeException("Inventory not found");
        }

        inventoryRepository.deleteById(id);
    }

    // Stock in
    public Medicine stockIn(
            Long medicineId,
            Integer quantity) {

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        medicine.setQuantity(
                medicine.getQuantity() + quantity);

        return medicineRepository.save(medicine);
    }

    // Stock out
    public Medicine stockOut(
            Long medicineId,
            Integer quantity) {

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        if (medicine.getQuantity() < quantity) {
            throw new RuntimeException(
                    "Insufficient stock");
        }

        medicine.setQuantity(
                medicine.getQuantity() - quantity);

        return medicineRepository.save(medicine);
    }
}