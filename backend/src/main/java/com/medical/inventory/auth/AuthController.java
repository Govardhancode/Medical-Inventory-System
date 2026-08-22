package com.medical.inventory.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =====================================================
    // SIGN UP
    // =====================================================

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestBody SignupRequest request) {

        try {

            if (request == null) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Invalid request."
                                )
                        );
            }

            if (request.fullName() == null ||
                    request.fullName().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Full name is required."
                                )
                        );
            }

            if (request.email() == null ||
                    request.email().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Email address is required."
                                )
                        );
            }

            if (request.password() == null ||
                    request.password().length() < 6) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Password must contain at least 6 characters."
                                )
                        );
            }

            User user =
                    authService.signup(
                            request.fullName(),
                            request.email(),
                            request.password()
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new AuthResponse(
                                    "Account created successfully.",
                                    user.getId(),
                                    user.getFullName(),
                                    user.getEmail()
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        try {

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Invalid login request."
                                )
                        );
            }

            if (request.email() == null ||
                    request.email().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Email address is required."
                                )
                        );
            }

            if (request.password() == null ||
                    request.password().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Password is required."
                                )
                        );
            }

            User user =
                    authService.login(
                            request.email(),
                            request.password()
                    );

            return ResponseEntity.ok(
                    new AuthResponse(
                            "Login successful.",
                            user.getId(),
                            user.getFullName(),
                            user.getEmail()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        /*
         * We intentionally return the same message whether
         * the email exists or not.
         *
         * This prevents someone from discovering which
         * email addresses have MedInventory accounts.
         */

        String message =
                "If an account exists for this email, "
                        + "a password reset link has been sent.";

        try {

            if (request == null ||
                    request.email() == null ||
                    request.email().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Please enter your email address."
                                )
                        );
            }

            authService.forgotPassword(
                    request.email()
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            message
                    )
            );

        } catch (Exception e) {

            /*
             * Do not expose whether the account exists.
             *
             * The detailed error remains on the backend.
             */

            System.err.println(
                    "Forgot password error: "
                            + e.getMessage()
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            message
                    )
            );
        }
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        try {

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Invalid reset request."
                                )
                        );
            }

            if (request.token() == null ||
                    request.token().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Reset token is missing."
                                )
                        );
            }

            if (request.newPassword() == null ||
                    request.newPassword().length() < 6) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Password must contain at least 6 characters."
                                )
                        );
            }

            authService.resetPassword(
                    request.token(),
                    request.newPassword()
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Password reset successfully."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request) {

        // =================================================
        // TEMPORARY DEBUG LOGGING
        // =================================================

        System.out.println(
                "================================================="
        );

        System.out.println(
                "CHANGE PASSWORD REQUEST RECEIVED"
        );

        if (request != null) {

            System.out.println(
                    "Email: " + request.email()
            );

            System.out.println(
                    "Current password received: "
                            + (
                            request.currentPassword() != null
                                    ? "YES"
                                    : "NO"
                    )
            );

            System.out.println(
                    "New password received: "
                            + (
                            request.newPassword() != null
                                    ? "YES"
                                    : "NO"
                    )
            );

        } else {

            System.out.println(
                    "Request body is NULL"
            );
        }

        System.out.println(
                "================================================="
        );

        try {

            // =================================================
            // VALIDATE REQUEST
            // =================================================

            if (request == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Invalid password change request."
                                )
                        );
            }

            // =================================================
            // VALIDATE EMAIL
            // =================================================

            if (request.email() == null ||
                    request.email().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Email address is required."
                                )
                        );
            }

            // =================================================
            // VALIDATE CURRENT PASSWORD
            // =================================================

            if (request.currentPassword() == null ||
                    request.currentPassword().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "Current password is required."
                                )
                        );
            }

            // =================================================
            // VALIDATE NEW PASSWORD
            // =================================================

            if (request.newPassword() == null ||
                    request.newPassword().length() < 6) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "New password must contain at least 6 characters."
                                )
                        );
            }

            // =================================================
            // PREVENT SAME PASSWORD
            // =================================================

            if (request.currentPassword()
                    .equals(request.newPassword())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new MessageResponse(
                                        "New password must be different from the current password."
                                )
                        );
            }

            // =================================================
            // CHANGE PASSWORD
            // =================================================

            authService.changePassword(
                    request.email(),
                    request.currentPassword(),
                    request.newPassword()
            );

            // =================================================
            // SUCCESS
            // =================================================

            System.out.println(
                    "PASSWORD CHANGE SUCCESSFUL FOR: "
                            + request.email()
            );

            return ResponseEntity.ok(
                    new MessageResponse(
                            "Password changed successfully."
                    )
            );

        } catch (RuntimeException e) {

            // =================================================
            // ERROR
            // =================================================

            System.err.println(
                    "PASSWORD CHANGE FAILED"
            );

            System.err.println(
                    "Email: " + (
                            request != null
                                    ? request.email()
                                    : "NULL"
                    )
            );

            System.err.println(
                    "Error: " + e.getMessage()
            );

            return ResponseEntity
                    .badRequest()
                    .body(
                            new MessageResponse(
                                    e.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // REQUEST RECORDS
    // =====================================================

    public record SignupRequest(
            String fullName,
            String email,
            String password
    ) {
    }

    public record LoginRequest(
            String email,
            String password
    ) {
    }

    public record ForgotPasswordRequest(
            String email
    ) {
    }

    public record ResetPasswordRequest(
            String token,
            String newPassword
    ) {
    }

    // =====================================================
    // CHANGE PASSWORD REQUEST
    // =====================================================

    public record ChangePasswordRequest(
            String email,
            String currentPassword,
            String newPassword
    ) {
    }

    // =====================================================
    // LOGIN / SIGNUP RESPONSE
    // =====================================================

    public record AuthResponse(
            String message,
            Long id,
            String name,
            String email
    ) {
    }

    // =====================================================
    // GENERAL MESSAGE RESPONSE
    // =====================================================

    public record MessageResponse(
            String message
    ) {
    }
}