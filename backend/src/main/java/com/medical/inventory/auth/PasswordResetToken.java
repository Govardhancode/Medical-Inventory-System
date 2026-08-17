package com.medical.inventory.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // RESET TOKEN
    // =====================================================

    @Column(
            nullable = false,
            unique = true,
            length = 100
    )
    private String token;

    // =====================================================
    // USER
    // =====================================================

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // =====================================================
    // EXPIRY TIME
    // =====================================================

    @Column(
            nullable = false
    )
    private LocalDateTime expiryTime;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public PasswordResetToken() {
    }

    // =====================================================
    // GET ID
    // =====================================================

    public Long getId() {
        return id;
    }

    // =====================================================
    // GET TOKEN
    // =====================================================

    public String getToken() {
        return token;
    }

    // =====================================================
    // SET TOKEN
    // =====================================================

    public void setToken(String token) {
        this.token = token;
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

    // =====================================================
    // GET EXPIRY TIME
    // =====================================================

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    // =====================================================
    // SET EXPIRY TIME
    // =====================================================

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }
}