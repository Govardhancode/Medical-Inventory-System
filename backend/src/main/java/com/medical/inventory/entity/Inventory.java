package com.medical.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "medicine_id", nullable = false, unique = true)
    private Medicine medicine;

    private Integer minimumStockLevel;

    private String storageLocation;

    private LocalDateTime lastUpdated;

    public Inventory() {
    }

    @PrePersist
    @PreUpdate
    public void updateTime() {
        lastUpdated = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
    }

    public Integer getMinimumStockLevel() {
        return minimumStockLevel;
    }

    public void setMinimumStockLevel(Integer minimumStockLevel) {
        this.minimumStockLevel = minimumStockLevel;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}