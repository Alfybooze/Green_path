package com.example.GreenPath.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.GreenPath.Model.User;
import com.example.GreenPath.Model.UserType;
import com.example.GreenPath.Repository.UserRepository;

@Service
@Transactional
public class userService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Spring Security UserDetailsService implementation
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        if (!user.isEnabled()) {
            throw new UsernameNotFoundException("User account is disabled");
        }
        
        return user;
    }

    // Authentication with role validation
    public User authenticateWithRole(String email, String password, UserType userType) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                // Check if password matches
                if (passwordEncoder.matches(password, user.getPassword())) {
                    // Check if user has the requested role
                    if (user.getUserType() == userType && user.isEnabled()) {
                        // Update last login time
                        user.updateLastLogin();
                        userRepository.save(user);
                        return user;
                    }
                }
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed", e);
        }
    }

    // Find user by email
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    // Find user by ID
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    // Save new user
    public User saveUser(User user) {
        try {
            // Check if user already exists
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                throw new RuntimeException("User with this email already exists");
            }

            // Encode password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            // Set default values
            user.setEnabled(true);
            user.setVerified(false);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            return userRepository.save(user);
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to save user: " + e.getMessage(), e);
        }
    }

    // Update existing user
    public User updateUser(User user) {
        try {
            Optional<User> existingUserOptional = userRepository.findById(user.getId());
            
            if (existingUserOptional.isPresent()) {
                User existingUser = existingUserOptional.get();
                
                // Update fields (don't update password here unless specifically requested)
                existingUser.setFirstName(user.getFirstName());
                existingUser.setLastName(user.getLastName());
                existingUser.setPhoneNumber(user.getPhoneNumber());
                existingUser.setLocation(user.getLocation());
                existingUser.setBio(user.getBio());
                existingUser.setUserType(user.getUserType());
                existingUser.setProfileImageUrl(user.getProfileImageUrl());
                
                // Update farmer-specific fields
                if (user.getUserType() == UserType.FARMER) {
                    existingUser.setFarmName(user.getFarmName());
                    existingUser.setFarmSizeHectares(user.getFarmSizeHectares());
                    existingUser.setPrimaryCrops(user.getPrimaryCrops());
                    existingUser.setFarmingExperienceYears(user.getFarmingExperienceYears());
                }
                
                // Update herder-specific fields
                if (user.getUserType() == UserType.HERDER) {
                    existingUser.setHerdType(user.getHerdType());
                    existingUser.setHerdSize(user.getHerdSize());
                    existingUser.setGrazingArea(user.getGrazingArea());
                    existingUser.setHerdingExperienceYears(user.getHerdingExperienceYears());
                }
                
                existingUser.setUpdatedAt(LocalDateTime.now());
                
                return userRepository.save(existingUser);
            } else {
                throw new RuntimeException("User not found with ID: " + user.getId());
            }
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to update user: " + e.getMessage(), e);
        }
    }

    // Update user password
    public boolean updatePassword(Long userId, String oldPassword, String newPassword) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                // Verify old password
                if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    user.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update password", e);
        }
    }

    // Change user role/type
    public User changeUserRole(Long userId, UserType newUserType) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setUserType(newUserType);
                user.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(user);
            } else {
                throw new RuntimeException("User not found with ID: " + userId);
            }
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to change user role: " + e.getMessage(), e);
        }
    }

    // Enable/disable user account
    public User toggleUserStatus(Long userId, boolean enabled) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setEnabled(enabled);
                user.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(user);
            } else {
                throw new RuntimeException("User not found with ID: " + userId);
            }
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to toggle user status: " + e.getMessage(), e);
        }
    }

    // Verify user account
    public User verifyUser(Long userId) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setVerified(true);
                user.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(user);
            } else {
                throw new RuntimeException("User not found with ID: " + userId);
            }
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to verify user: " + e.getMessage(), e);
        }
    }

    // Delete user
    public boolean deleteUser(Long userId) {
        try {
            if (userRepository.existsById(userId)) {
                userRepository.deleteById(userId);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user: " + e.getMessage(), e);
        }
    }

    // Get all users
    public List<User> getAllUsers() {
        try {
            return userRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch users", e);
        }
    }

    // Get users by type
    public List<User> getUsersByType(UserType userType) {
        try {
            return userRepository.findByUserType(userType);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch users by type", e);
        }
    }

    // Get farmers only
    public List<User> getAllFarmers() {
        return getUsersByType(UserType.FARMER);
    }

    // Get herders only
    public List<User> getAllHerders() {
        return getUsersByType(UserType.HERDER);
    }

    // Search users by name or location
    public List<User> searchUsers(String searchTerm) {
        try {
            return userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrLocationContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm);
        } catch (Exception e) {
            throw new RuntimeException("Failed to search users", e);
        }
    }

    // Get users with recent activity (logged in within last 30 days)
    public List<User> getActiveUsers() {
        try {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            return userRepository.findByLastLoginAfter(thirtyDaysAgo);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch active users", e);
        }
    }

    // Count users by type
    public long countUsersByType(UserType userType) {
        try {
            return userRepository.countByUserType(userType);
        } catch (Exception e) {
            throw new RuntimeException("Failed to count users by type", e);
        }
    }

    // Check if email exists
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    // Check if phone number exists
    public boolean phoneExists(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber).isPresent();
    }

    // Update profile image
    public User updateProfileImage(Long userId, String imageUrl) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setProfileImageUrl(imageUrl);
                user.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(user);
            } else {
                throw new RuntimeException("User not found with ID: " + userId);
            }
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to update profile image: " + e.getMessage(), e);
        }
    }

    // Get user statistics
    public UserStats getUserStats() {
        try {
            long totalUsers = userRepository.count();
            long farmers = countUsersByType(UserType.FARMER);
            long herders = countUsersByType(UserType.HERDER);
            long verifiedUsers = userRepository.countByVerifiedTrue();
            long activeUsers = getActiveUsers().size();
            
            return new UserStats(totalUsers, farmers, herders, verifiedUsers, activeUsers);
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch user statistics", e);
        }
    }

    // Inner class for user statistics
    public static class UserStats {
        private final long totalUsers;
        private final long farmers;
        private final long herders;
        private final long verifiedUsers;
        private final long activeUsers;

        public UserStats(long totalUsers, long farmers, long herders, long verifiedUsers, long activeUsers) {
            this.totalUsers = totalUsers;
            this.farmers = farmers;
            this.herders = herders;
            this.verifiedUsers = verifiedUsers;
            this.activeUsers = activeUsers;
        }

        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getFarmers() { return farmers; }
        public long getHerders() { return herders; }
        public long getVerifiedUsers() { return verifiedUsers; }
        public long getActiveUsers() { return activeUsers; }
    }
}