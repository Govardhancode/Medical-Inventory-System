
package com.medical.inventory.entity;

import com.medical.inventory.auth.User;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "medicine")
public class Medicine {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // MEDICINE DETAILS
    // =====================================================

    private String name;

    private String category;

    private String manufacturer;

    private String batchNumber;

    private Integer quantity;

    private Double purchasePrice;

    private Double sellingPrice;

    private LocalDate expiryDate;

    // =====================================================
    // OWNER / USER
    // =====================================================

    /*
     * Every medicine belongs to the user who created it.
     *
     * This allows the application to keep medicine
     * data separate between different accounts.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Medicine() {
    }

    // =====================================================
    // GET ID
    // =====================================================

    public Long getId() {
        return id;
    }

    // =====================================================
    // SET ID
    // =====================================================

    public void setId(Long id) {
        this.id = id;
    }

    // =====================================================
    // GET NAME
    // =====================================================

    public String getName() {
        return name;
    }

    // =====================================================
    // SET NAME
    // =====================================================

    public void setName(String name) {
        this.name = name;
    }

    // =====================================================
    // GET CATEGORY
    // =====================================================

    public String getCategory() {
        return category;
    }

    // =====================================================
    // SET CATEGORY
    // =====================================================

    public void setCategory(String category) {
        this.category = category;
    }

    // =====================================================
    // GET MANUFACTURER
    // =====================================================

    public String getManufacturer() {
        return manufacturer;
    }

    // =====================================================
    // SET MANUFACTURER
    // =====================================================

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    // =====================================================
    // GET BATCH NUMBER
    // =====================================================

    public String getBatchNumber() {
        return batchNumber;
    }

    // =====================================================
    // SET BATCH NUMBER
    // =====================================================

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    // =====================================================
    // GET QUANTITY
    // =====================================================

    public Integer getQuantity() {
        return quantity;
    }

    // =====================================================
    // SET QUANTITY
    // =====================================================

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    // =====================================================
    // GET PURCHASE PRICE
    // =====================================================

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    // =====================================================
    // SET PURCHASE PRICE
    // =====================================================

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    // =====================================================
    // GET SELLING PRICE
    // =====================================================

    public Double getSellingPrice() {
        return sellingPrice;
    }

    // =====================================================
    // SET SELLING PRICE
    // =====================================================

    public void setSellingPrice(Double sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    // =====================================================
    // GET EXPIRY DATE
    // =====================================================

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    // =====================================================
    // SET EXPIRY DATE
    // =====================================================

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    // =====================================================
    // GET USER
    // =====================================================

    public User getUser() {
        return user;
    }

    // =====================================================
    // SET USER
    // =====================================================

    public void setUser(User user) {
        this.user = user;
    }
}

