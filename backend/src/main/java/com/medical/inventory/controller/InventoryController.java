package com.medical.inventory.controller;

import com.medical.inventory.entity.Inventory;
import com.medical.inventory.entity.Medicine;
import com.medical.inventory.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Create inventory
    @PostMapping("/medicine/{medicineId}")
    public Inventory createInventory(
            @PathVariable Long medicineId,
            @RequestBody Inventory inventory) {

        return inventoryService.createInventory(
                medicineId,
                inventory);
    }

    // Get all inventory
    @GetMapping
    public List<Inventory> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    // Get inventory by ID
    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryById(
            @PathVariable Long id) {

        return inventoryService.getInventoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get inventory by medicine
    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<Inventory> getInventoryByMedicine(
            @PathVariable Long medicineId) {

        return inventoryService
                .getInventoryByMedicineId(medicineId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update inventory
    @PutMapping("/{id}")
    public Inventory updateInventory(
            @PathVariable Long id,
            @RequestBody Inventory inventory) {

        return inventoryService.updateInventory(
                id,
                inventory);
    }

    // Delete inventory
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteInventory(
            @PathVariable Long id) {

        inventoryService.deleteInventory(id);

        return ResponseEntity.ok(
                "Inventory deleted successfully");
    }

    // Stock in
    @PutMapping("/stock-in/{medicineId}")
    public Medicine stockIn(
            @PathVariable Long medicineId,
            @RequestParam Integer quantity) {

        return inventoryService.stockIn(
                medicineId,
                quantity);
    }

    // Stock out
    @PutMapping("/stock-out/{medicineId}")
    public Medicine stockOut(
            @PathVariable Long medicineId,
            @RequestParam Integer quantity) {

        return inventoryService.stockOut(
                medicineId,
                quantity);
    }
}