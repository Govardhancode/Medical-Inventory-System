package com.medical.inventory.auth;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            JavaMailSender mailSender) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
    }

    // =====================================================
    // SIGN UP
    // =====================================================

    public User signup(
            String fullName,
            String email,
            String password) {

        if (fullName == null ||
                fullName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Full name is required."
            );
        }

        if (email == null ||
                email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Email address is required."
            );
        }

        if (password == null ||
                password.length() < 6) {

            throw new RuntimeException(
                    "Password must contain at least 6 characters."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(
                normalizedEmail)) {

            throw new RuntimeException(
                    "An account with this email already exists. Please sign in."
            );
        }

        User user = new User();

        user.setFullName(
                fullName.trim()
        );

        user.setEmail(
                normalizedEmail
        );

        // Never store the original password.
        user.setPassword(
                passwordEncoder.encode(password)
        );

        return userRepository.save(user);
    }

    // =====================================================
    // LOGIN
    // =====================================================

    public User login(
            String email,
            String password) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Please enter your email address."
            );
        }

        if (password == null ||
                password.isEmpty()) {

            throw new RuntimeException(
                    "Please enter your password."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid email or password."
                                )
                        );

        boolean passwordMatches =
                passwordEncoder.matches(
                        password,
                        user.getPassword()
                );

        if (!passwordMatches) {

            throw new RuntimeException(
                    "Invalid email or password."
            );
        }

        return user;
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @Transactional
    public void forgotPassword(
            String email) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Please enter your email address."
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElse(null);

        /*
         * If the account does not exist,
         * simply return.
         *
         * This prevents exposing whether
         * an email is registered.
         */
        if (user == null) {
            return;
        }

        // =================================================
        // DELETE OLD RESET TOKENS
        // =================================================

        /*
         * This is important.
         *
         * Every time the user requests a new
         * password reset, any previous token
         * is removed.
         */
        tokenRepository.deleteByUser(user);

        // =================================================
        // GENERATE NEW TOKEN
        // =================================================

        String token =
                UUID.randomUUID().toString();

        // =================================================
        // CREATE RESET TOKEN
        // =================================================

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setToken(token);

        resetToken.setUser(user);

        /*
         * Token is valid for 15 minutes.
         */
        resetToken.setExpiryTime(
                LocalDateTime.now()
                        .plusMinutes(15)
        );

        // =================================================
        // SAVE TOKEN
        // =================================================

        tokenRepository.save(resetToken);

        // =================================================
        // CREATE RESET LINK
        // =================================================

        String resetLink =
                "http://localhost:5173/reset-password?token="
                        + token;

        // =================================================
        // CREATE EMAIL
        // =================================================

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(
                user.getEmail()
        );

        message.setSubject(
                "MedInventory - Reset Your Password"
        );

        message.setText(
                "Hello "
                        + user.getFullName()
                        + ",\n\n"

                        + "We received a request to reset "
                        + "your MedInventory password.\n\n"

                        + "Click the link below to create "
                        + "a new password:\n\n"

                        + resetLink
                        + "\n\n"

                        + "This link will expire in 15 minutes.\n\n"

                        + "If you did not request a password reset, "
                        + "you can safely ignore this email.\n\n"

                        + "Regards,\n"
                        + "MedInventory Team"
        );

        // =================================================
        // SEND EMAIL
        // =================================================

        mailSender.send(message);
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    public void resetPassword(
            String token,
            String newPassword) {

        if (token == null ||
                token.trim().isEmpty()) {

            throw new RuntimeException(
                    "Reset token is missing."
            );
        }

        if (newPassword == null ||
                newPassword.length() < 6) {

            throw new RuntimeException(
                    "Password must contain at least 6 characters."
            );
        }

        // =================================================
        // FIND TOKEN
        // =================================================

        PasswordResetToken resetToken =
                tokenRepository
                        .findByToken(token.trim())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid or expired reset link."
                                )
                        );

        // =================================================
        // CHECK EXPIRY
        // =================================================

        if (resetToken.getExpiryTime()
                .isBefore(LocalDateTime.now())) {

            tokenRepository.delete(
                    resetToken
            );

            throw new RuntimeException(
                    "This reset link has expired. Please request a new one."
            );
        }

        // =================================================
        // GET USER
        // =================================================

        User user =
                resetToken.getUser();

        if (user == null) {

            tokenRepository.delete(
                    resetToken
            );

            throw new RuntimeException(
                    "Unable to reset password."
            );
        }

        // =================================================
        // UPDATE PASSWORD
        // =================================================

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        userRepository.save(user);

        // =================================================
        // DELETE USED TOKEN
        // =================================================

        /*
         * Reset tokens are single-use.
         *
         * Once the password is successfully changed,
         * this token cannot be used again.
         */
        tokenRepository.delete(
                resetToken
        );
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    public void changePassword(
            String email,
            String currentPassword,
            String newPassword) {

        // =================================================
        // VALIDATE EMAIL
        // =================================================

        if (email == null ||
                email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Email address is required."
            );
        }

        // =================================================
        // VALIDATE CURRENT PASSWORD
        // =================================================

        if (currentPassword == null ||
                currentPassword.isEmpty()) {

            throw new RuntimeException(
                    "Current password is required."
            );
        }

        // =================================================
        // VALIDATE NEW PASSWORD
        // =================================================

        if (newPassword == null ||
                newPassword.length() < 6) {

            throw new RuntimeException(
                    "New password must contain at least 6 characters."
            );
        }

        // =================================================
        // FIND USER
        // =================================================

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User account not found."
                                )
                        );

        // =================================================
        // VERIFY CURRENT PASSWORD
        // =================================================

        boolean passwordMatches =
                passwordEncoder.matches(
                        currentPassword,
                        user.getPassword()
                );

        if (!passwordMatches) {

            throw new RuntimeException(
                    "Current password is incorrect."
            );
        }

        // =================================================
        // PREVENT SAME PASSWORD
        // =================================================

        if (passwordEncoder.matches(
                newPassword,
                user.getPassword())) {

            throw new RuntimeException(
                    "New password must be different from the current password."
            );
        }

        // =================================================
        // UPDATE PASSWORD
        // =================================================

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        // =================================================
        // SAVE USER
        // =================================================

        userRepository.save(user);
    }
}