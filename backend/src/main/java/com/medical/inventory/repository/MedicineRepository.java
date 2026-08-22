package com.medical.inventory.repository;

import com.medical.inventory.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByNameContainingIgnoreCase(String name);

    List<Medicine> findByQuantityLessThan(Integer quantity);

    List<Medicine> findByExpiryDateBetween(LocalDate startDate, LocalDate endDate);
}