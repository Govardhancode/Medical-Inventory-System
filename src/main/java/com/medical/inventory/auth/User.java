package com.medical.inventory.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // FULL NAME
    // =====================================================

    @Column(
            name = "full_name",
            nullable = false
    )
    private String fullName;

    // =====================================================
    // EMAIL
    // =====================================================

    @Column(
            nullable = false,
            unique = true
    )
    private String email;

    // =====================================================
    // MOBILE NUMBER
    // =====================================================

    /*
     * Store the mobile number in international
     * E.164 format.
     *
     * Example:
     * +919876543210
     *
     * This field is nullable because existing
     * users may not have a mobile number yet.
     */
    @Column(
            name = "mobile_number",
            unique = true
    )
    private String mobileNumber;

    // =====================================================
    // PASSWORD
    // =====================================================

    /*
     * The password stored here must ALWAYS be
     * BCrypt-encrypted.
     */
    @Column(
            nullable = false
    )
    private String password;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public User() {
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
    // GET FULL NAME
    // =====================================================

    public String getFullName() {
        return fullName;
    }

    // =====================================================
    // SET FULL NAME
    // =====================================================

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    // =====================================================
    // GET EMAIL
    // =====================================================

    public String getEmail() {
        return email;
    }

    // =====================================================
    // SET EMAIL
    // =====================================================

    public void setEmail(String email) {
        this.email = email;
    }

    // =====================================================
    // GET MOBILE NUMBER
    // =====================================================

    public String getMobileNumber() {
        return mobileNumber;
    }

    // =====================================================
    // SET MOBILE NUMBER
    // =====================================================

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    // =====================================================
    // GET PASSWORD
    // =====================================================

    public String getPassword() {
        return password;
    }

    // =====================================================
    // SET PASSWORD
    // =====================================================

    public void setPassword(String password) {
        this.password = password;
    }
}