package com.medical.inventory.dashboard;

import com.medical.inventory.repository.MedicineRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final MedicineRepository medicineRepository;

    public DashboardController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary() {

        Map<String, Object> summary = new HashMap<>();

        long totalMedicines = medicineRepository.count();

        long totalStock = medicineRepository.findAll()
                .stream()
                .mapToLong(medicine -> medicine.getQuantity())
                .sum();

        long lowStock = medicineRepository.findAll()
                .stream()
                .filter(medicine -> medicine.getQuantity() < 20)
                .count();

        LocalDate today = LocalDate.now();
        LocalDate expiryDate = today.plusDays(90);

        long expiringMedicines = medicineRepository.findAll()
                .stream()
                .filter(medicine ->
                        medicine.getExpiryDate() != null &&
                        !medicine.getExpiryDate().isBefore(today) &&
                        !medicine.getExpiryDate().isAfter(expiryDate)
                )
                .count();

        summary.put("totalMedicines", totalMedicines);
        summary.put("totalStock", totalStock);
        summary.put("lowStock", lowStock);
        summary.put("expiringMedicines", expiringMedicines);

        return summary;
    }
}