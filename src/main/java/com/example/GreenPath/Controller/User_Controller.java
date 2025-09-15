package com.example.GreenPath.Controller;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.GreenPath.Model.User;
import com.example.GreenPath.Model.UserType;
import com.example.GreenPath.Service.EmailService;
import com.example.GreenPath.Service.userService;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/user")
@Slf4j
public class User_Controller {


    @Autowired
    private userService userService;
    
    @Autowired
    private EmailService emailService;
    
    // Configuration values from YAML
    @Value("${app.cleanup.pending-user-expiry-minutes:15}")
    private int pendingUserExpiryMinutes;
    
    @Value("${app.cleanup.enable-detailed-logging:false}")
    private boolean enableDetailedLogging;
    
    // Store temporary user data and verification codes
    private final Map<String, PendingUser> pendingUsers = new ConcurrentHashMap<>();
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();
    
    // Inner class to store pending user data
    private class PendingUser {
        User user;
        LocalDateTime expiryTime;
        
        PendingUser(User user) {
            this.user = user;
            this.expiryTime = LocalDateTime.now().plusMinutes(pendingUserExpiryMinutes);
        }
        
        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryTime);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> processSignup(@RequestParam("firstName") String firstName,
                                         @RequestParam("lastName") String lastName,
                                         @RequestParam("email") String email,
                                         @RequestParam("phone") String phone,
                                         @RequestParam("password") String password,
                                         @RequestParam("role") String role,
                                         HttpServletRequest request) {
        
        String clientIp = getClientIpAddress(request);
        String sessionId = request.getSession().getId();
        
        log.info("=== SIGNUP REQUEST START ===");
        log.info("Session ID: {}", sessionId);
        log.info("Client IP: {}", clientIp);
        log.info("Email: {}", email);
        log.info("Role: {}", role);
        log.info("Phone: {}", phone != null ? phone.replaceAll("\\d(?=\\d{4})", "*") : "null");
        log.debug("Full request parameters - firstName: {}, lastName: {}, email: {}, phone: {}, role: {}", 
                 firstName, lastName, email, phone, role);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Validate input parameters
            log.debug("Validating input parameters...");
            if (firstName == null || firstName.trim().isEmpty()) {
                log.warn("Signup failed - First name is empty. Email: {}, IP: {}", email, clientIp);
                return createErrorResponse("First name is required");
            }
            if (lastName == null || lastName.trim().isEmpty()) {
                log.warn("Signup failed - Last name is empty. Email: {}, IP: {}", email, clientIp);
                return createErrorResponse("Last name is required");
            }
            if (email == null || email.trim().isEmpty()) {
                log.warn("Signup failed - Email is empty. IP: {}", clientIp);
                return createErrorResponse("Email is required");
            }
            if (password == null || password.trim().isEmpty()) {
                log.warn("Signup failed - Password is empty. Email: {}, IP: {}", email, clientIp);
                return createErrorResponse("Password is required");
            }
            if (role == null || role.trim().isEmpty()) {
                log.warn("Signup failed - Role is empty. Email: {}, IP: {}", email, clientIp);
                return createErrorResponse("Role is required");
            }
            
            log.debug("Input validation passed for email: {}", email);
            
            // Convert string role to UserType enum
            log.debug("Converting role '{}' to UserType enum", role);
            UserType userType;
            try {
                userType = UserType.valueOf(role.toUpperCase());
                log.debug("Role conversion successful: {}", userType);
            } catch (IllegalArgumentException e) {
                log.warn("Signup failed - Invalid role '{}' provided. Email: {}, IP: {}", role, email, clientIp);
                return createErrorResponse("Invalid role selected");
            }
            
            // Check if user already exists
            log.debug("Checking if user already exists with email: {}", email);
            User existingUser = userService.findByEmail(email);
            if (existingUser != null) {
                log.warn("Signup failed - User already exists. Email: {}, IP: {}", email, clientIp);
                return createErrorResponse("User with this email already exists");
            }
            log.debug("User does not exist, proceeding with registration");
            
            // Create new user object
            log.debug("Creating new user object for email: {}", email);
            User newUser = User.builder()
                .firstName(firstName.trim())
                .lastName(lastName.trim())
                .email(email.trim().toLowerCase())
                .phoneNumber(phone)
                .password(password) // Will be encoded in the service
                .userType(userType)
                .enabled(true)
                .verified(false)
                .build();
            
            log.debug("User object created successfully");
            
            // Generate verification code
            String verificationCode = generateVerificationCode();
            log.debug("Generated verification code for email: {}", email);
            
            // Store user temporarily
            String normalizedEmail = email.trim().toLowerCase();
            pendingUsers.put(normalizedEmail, new PendingUser(newUser));
            verificationCodes.put(normalizedEmail, verificationCode);
            
            log.info("User data stored temporarily. Pending users count: {}, Verification codes count: {}", 
                    pendingUsers.size(), verificationCodes.size());
            
            // Send verification email
            log.debug("Attempting to send verification email to: {}", email);
            emailService.sendVerificationEmail(email, verificationCode);
            log.info("Verification email sent successfully to: {}", email);
            
            long processingTime = System.currentTimeMillis() - startTime;
            log.info("=== SIGNUP REQUEST SUCCESS === Email: {}, Processing time: {}ms, IP: {}", 
                    email, processingTime, clientIp);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Verification code sent to your email",
                "email", email
            ));
            
        } catch (MessagingException e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("=== SIGNUP REQUEST FAILED === Email service error for: {}, Processing time: {}ms, IP: {}", 
                     email, processingTime, clientIp, e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to send verification email. Please try again."
            ));
        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("=== SIGNUP REQUEST FAILED === Unexpected error for: {}, Processing time: {}ms, IP: {}", 
                     email, processingTime, clientIp, e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Registration failed: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        String code = request.get("code");
        String clientIp = getClientIpAddress(httpRequest);
        String sessionId = httpRequest.getSession().getId();
        
        log.info("=== CODE VERIFICATION START ===");
        log.info("Session ID: {}", sessionId);
        log.info("Client IP: {}", clientIp);
        log.info("Email: {}", email);
        log.debug("Verification code received: {}", code);
        
        long startTime = System.currentTimeMillis();
        
        if (email == null || code == null) {
            log.warn("Code verification failed - Missing parameters. Email: {}, Code provided: {}, IP: {}", 
                    email, code != null, clientIp);
            return createErrorResponse("Email and code are required");
        }
        
        try {
            String normalizedEmail = email.trim().toLowerCase();
            
            // Check if pending user exists
            log.debug("Checking for pending user with email: {}", normalizedEmail);
            PendingUser pendingUser = pendingUsers.get(normalizedEmail);
            if (pendingUser == null) {
                log.warn("Code verification failed - No pending registration found. Email: {}, IP: {}", 
                        email, clientIp);
                return createErrorResponse("No pending registration found for this email");
            }
            log.debug("Pending user found for email: {}", normalizedEmail);
            
            // Check if registration has expired
            if (pendingUser.isExpired()) {
                log.warn("Code verification failed - Registration expired. Email: {}, Expiry: {}, IP: {}", 
                        email, pendingUser.expiryTime, clientIp);
                pendingUsers.remove(normalizedEmail);
                verificationCodes.remove(normalizedEmail);
                return createErrorResponse("Registration session has expired. Please register again.");
            }
            log.debug("Registration session is still valid for email: {}", normalizedEmail);
            
            // Check verification code
            String storedCode = verificationCodes.get(normalizedEmail);
            if (storedCode == null || !storedCode.equals(code)) {
                log.warn("Code verification failed - Invalid code. Email: {}, Expected exists: {}, IP: {}", 
                        email, storedCode != null, clientIp);
                return createErrorResponse("Invalid verification code");
            }
            log.debug("Verification code validated successfully for email: {}", normalizedEmail);
            
            // Save user to database
            User userToSave = pendingUser.user;
            userToSave.setVerified(true);
            
            log.debug("Attempting to save user to database: {}", normalizedEmail);
            User savedUser = userService.saveUser(userToSave);
            
            if (savedUser != null) {
                // Clean up temporary storage
                pendingUsers.remove(normalizedEmail);
                verificationCodes.remove(normalizedEmail);
                
                long processingTime = System.currentTimeMillis() - startTime;
                log.info("=== CODE VERIFICATION SUCCESS === Email: {}, User ID: {}, Processing time: {}ms, IP: {}", 
                        email, savedUser.getId(), processingTime, clientIp);
                log.info("Cleanup completed. Remaining - Pending users: {}, Verification codes: {}", 
                        pendingUsers.size(), verificationCodes.size());
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Email verified successfully! Registration complete.",
                    "redirectUrl", "/login"
                ));
            } else {
                log.error("Code verification failed - User save returned null. Email: {}, IP: {}", 
                         email, clientIp);
                return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to save user. Please try again."
                ));
            }
            
        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("=== CODE VERIFICATION FAILED === Unexpected error. Email: {}, Processing time: {}ms, IP: {}", 
                     email, processingTime, clientIp, e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Verification failed: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/resend-code")
    public ResponseEntity<?> resendVerificationCode(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        String clientIp = getClientIpAddress(httpRequest);
        String sessionId = httpRequest.getSession().getId();
        
        log.info("=== RESEND CODE REQUEST ===");
        log.info("Session ID: {}", sessionId);
        log.info("Client IP: {}", clientIp);
        log.info("Email: {}", email);
        
        if (email == null) {
            log.warn("Resend code failed - Email is required. IP: {}", clientIp);
            return createErrorResponse("Email is required");
        }
        
        try {
            String normalizedEmail = email.trim().toLowerCase();
            
            // Check if pending user exists
            PendingUser pendingUser = pendingUsers.get(normalizedEmail);
            if (pendingUser == null) {
                log.warn("Resend code failed - No pending registration found. Email: {}, IP: {}", 
                        email, clientIp);
                return createErrorResponse("No pending registration found for this email");
            }
            
            // Check if registration has expired
            if (pendingUser.isExpired()) {
                log.warn("Resend code failed - Registration expired. Email: {}, IP: {}", email, clientIp);
                pendingUsers.remove(normalizedEmail);
                verificationCodes.remove(normalizedEmail);
                return createErrorResponse("Registration session has expired. Please register again.");
            }
            
            // Generate new verification code
            String newVerificationCode = generateVerificationCode();
            verificationCodes.put(normalizedEmail, newVerificationCode);
            log.debug("New verification code generated for email: {}", email);
            
            // Send new verification email
            emailService.sendVerificationEmail(email, newVerificationCode);
            log.info("New verification code sent successfully to: {}, IP: {}", email, clientIp);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "New verification code sent to your email"
            ));
            
        } catch (MessagingException e) {
            log.error("Resend code failed - Email service error. Email: {}, IP: {}", email, clientIp, e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to send verification email. Please try again."
            ));
        } catch (Exception e) {
            log.error("Resend code failed - Unexpected error. Email: {}, IP: {}", email, clientIp, e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to resend code: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/cancel-registration")
    public ResponseEntity<?> cancelRegistration(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        String email = request.get("email");
        String clientIp = getClientIpAddress(httpRequest);
        
        log.info("=== REGISTRATION CANCELLATION ===");
        log.info("Email: {}, IP: {}", email, clientIp);
        
        if (email == null) {
            log.warn("Cancel registration failed - Email is required. IP: {}", clientIp);
            return createErrorResponse("Email is required");
        }
        
        String normalizedEmail = email.trim().toLowerCase();
        
        // Clean up temporary storage
        boolean userRemoved = pendingUsers.remove(normalizedEmail) != null;
        boolean codeRemoved = verificationCodes.remove(normalizedEmail) != null;
        
        log.info("Registration cancelled successfully. Email: {}, User removed: {}, Code removed: {}, IP: {}", 
                email, userRemoved, codeRemoved, clientIp);
        log.debug("Remaining - Pending users: {}, Verification codes: {}", 
                 pendingUsers.size(), verificationCodes.size());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Registration cancelled"
        ));
    }

    @PostMapping("/profile/update")
    public String updateProfile(@ModelAttribute("user") User user, 
                               HttpSession session, 
                               RedirectAttributes redirectAttributes,
                               HttpServletRequest httpRequest) {
        String clientIp = getClientIpAddress(httpRequest);
        User loggedInUser = (User) session.getAttribute("loggedInUser");
        
        log.info("=== PROFILE UPDATE REQUEST ===");
        log.info("Session ID: {}, IP: {}", session.getId(), clientIp);
        log.info("Logged in user: {}", loggedInUser != null ? loggedInUser.getEmail() : "null");
        
        if (loggedInUser == null) {
            log.warn("Profile update failed - User not logged in. IP: {}", clientIp);
            return "redirect:/login";
        }
        
        try {
            log.debug("Updating profile for user ID: {}, Email: {}", loggedInUser.getId(), loggedInUser.getEmail());
            user.setId(loggedInUser.getId());
            User updatedUser = userService.updateUser(user);
            session.setAttribute("loggedInUser", updatedUser);
            
            log.info("Profile updated successfully for user: {}, IP: {}", updatedUser.getEmail(), clientIp);
            redirectAttributes.addFlashAttribute("success", "Profile updated successfully");
            return "redirect:/profile";
        } catch (Exception e) {
            log.error("Profile update failed for user: {}, IP: {}", loggedInUser.getEmail(), clientIp, e);
            redirectAttributes.addFlashAttribute("error", "Profile update failed: " + e.getMessage());
            return "redirect:/profile";
        }
    }
    
    /**
     * Scheduled cleanup method - runs every 5 minutes (configurable via YAML)
     */
    @Scheduled(fixedRateString = "${app.cleanup.interval:300000}")
    public void cleanupExpiredPendingUsers() {
        log.debug("=== SCHEDULED CLEANUP START ===");
        long startTime = System.currentTimeMillis();
        
        if (enableDetailedLogging) {
            log.debug("Starting cleanup - Current pending users: {}, Current codes: {}", 
                     pendingUsers.size(), verificationCodes.size());
        }
        
        int removedUsers = 0;
        int removedCodes = 0;
        
        // Clean up expired pending users
        var iterator = pendingUsers.entrySet().iterator();
        while (iterator.hasNext()) {
            var entry = iterator.next();
            if (entry.getValue().isExpired()) {
                iterator.remove();
                removedUsers++;
                
                if (verificationCodes.remove(entry.getKey()) != null) {
                    removedCodes++;
                }
                
                if (enableDetailedLogging) {
                    log.debug("Cleaned up expired pending user: {}, Expired at: {}", 
                             entry.getKey(), entry.getValue().expiryTime);
                }
            }
        }
        
        // Clean up orphaned verification codes
        var codeIterator = verificationCodes.entrySet().iterator();
        while (codeIterator.hasNext()) {
            var entry = codeIterator.next();
            if (!pendingUsers.containsKey(entry.getKey())) {
                codeIterator.remove();
                removedCodes++;
                
                if (enableDetailedLogging) {
                    log.debug("Cleaned up orphaned verification code for: {}", entry.getKey());
                }
            }
        }
        
        long processingTime = System.currentTimeMillis() - startTime;
        
        if (removedUsers > 0 || removedCodes > 0) {
            log.info("=== CLEANUP COMPLETED === Removed {} expired users and {} codes in {}ms. " +
                    "Remaining - Pending users: {}, Codes: {}", 
                    removedUsers, removedCodes, processingTime, pendingUsers.size(), verificationCodes.size());
        } else if (enableDetailedLogging) {
            log.debug("=== CLEANUP COMPLETED === No expired items found in {}ms. " +
                     "Current - Pending users: {}, Codes: {}", 
                     processingTime, pendingUsers.size(), verificationCodes.size());
        }
    }
    
    /**
     * Manual cleanup endpoint for testing/admin purposes
     */
    @PostMapping("/admin/cleanup")
    public ResponseEntity<?> manualCleanup(HttpServletRequest httpRequest) {
        String clientIp = getClientIpAddress(httpRequest);
        log.info("=== MANUAL CLEANUP TRIGGERED === IP: {}", clientIp);
        
        try {
            cleanupExpiredPendingUsers();
            
            log.info("Manual cleanup completed successfully. IP: {}", clientIp);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cleanup completed successfully",
                "pendingUsers", pendingUsers.size(),
                "verificationCodes", verificationCodes.size()
            ));
        } catch (Exception e) {
            log.error("Manual cleanup failed. IP: {}", clientIp, e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Cleanup failed: " + e.getMessage()
            ));
        }
    }

    /**
     * Utility method to generate 6-digit verification code
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        String verificationCode = String.valueOf(code);
        log.debug("Verification code generated successfully");
        return verificationCode;
    }
    
    /**
     * Utility method to get client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !xForwardedFor.equalsIgnoreCase("unknown")) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !xRealIp.equalsIgnoreCase("unknown")) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Utility method to create consistent error responses
     */
    private ResponseEntity<?> createErrorResponse(String message) {
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", message
        ));
    }
}