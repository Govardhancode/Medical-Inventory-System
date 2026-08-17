package com.medical.inventory.controller;

import com.medical.inventory.entity.Supplier;
import com.medical.inventory.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    // Add supplier
    @PostMapping
    public Supplier addSupplier(@RequestBody Supplier supplier) {
        return supplierService.addSupplier(supplier);
    }

    // Get all suppliers
    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierService.getAllSuppliers();
    }

    // Get supplier by ID
    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(
            @PathVariable Long id) {

        return supplierService.getSupplierById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update supplier
    @PutMapping("/{id}")
    public Supplier updateSupplier(
            @PathVariable Long id,
            @RequestBody Supplier supplier) {

        return supplierService.updateSupplier(id, supplier);
    }

    // Delete supplier
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSupplier(
            @PathVariable Long id) {

        supplierService.deleteSupplier(id);

        return ResponseEntity.ok(
                "Supplier deleted successfully");
    }
}