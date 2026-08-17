package com.medical.inventory.controller;

import com.medical.inventory.entity.Medicine;
import com.medical.inventory.service.MedicineService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "*")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(
            MedicineService medicineService
    ) {
        this.medicineService = medicineService;
    }

    // =========================
    // ADD MEDICINE
    // =========================

    @PostMapping
    public Medicine addMedicine(
            @RequestBody Medicine medicine
    ) {

        return medicineService.addMedicine(
                medicine
        );
    }

    // =========================
    // GET ALL MEDICINES
    // =========================

    @GetMapping
    public List<Medicine> getAllMedicines() {

        return medicineService.getAllMedicines();
    }

    // =========================
    // SEARCH MEDICINES
    // =========================

    @GetMapping("/search")
    public List<Medicine> searchMedicines(
            @RequestParam String name
    ) {

        return medicineService.searchMedicines(
                name
        );
    }

    // =========================
    // LOW STOCK MEDICINES
    // =========================

    @GetMapping("/low-stock")
    public List<Medicine> getLowStockMedicines(
            @RequestParam(
                    defaultValue = "10"
            )
            Integer quantity
    ) {

        return medicineService
                .getLowStockMedicines(quantity);
    }

    // =========================
    // EXPIRING MEDICINES
    // =========================

    @GetMapping("/expiring")
    public List<Medicine> getExpiringMedicines(
            @RequestParam(
                    defaultValue = "30"
            )
            Integer days
    ) {

        return medicineService
                .getExpiringMedicines(days);
    }

    // =========================
    // GET MEDICINE BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(
            @PathVariable Long id
    ) {

        return medicineService
                .getMedicineById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    // =========================
    // UPDATE MEDICINE
    // =========================

    @PutMapping("/{id}")
    public Medicine updateMedicine(
            @PathVariable Long id,
            @RequestBody Medicine medicine
    ) {

        return medicineService.updateMedicine(
                id,
                medicine
        );
    }

    // =========================
    // DELETE MEDICINE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMedicine(
            @PathVariable Long id
    ) {

        try {

            medicineService.deleteMedicine(id);

            return ResponseEntity.ok(
                    "Medicine deleted successfully"
            );

        } catch (
                DataIntegrityViolationException e
        ) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            "Cannot delete this medicine because it is already used in a bill."
                    );
        }
    }

    // =========================
    // UPDATE STOCK
    // =========================

    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable Long id,
            @RequestParam Integer change
    ) {

        try {

            Medicine updatedMedicine =
                    medicineService.updateStock(
                            id,
                            change
                    );

            return ResponseEntity.ok(
                    updatedMedicine
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}