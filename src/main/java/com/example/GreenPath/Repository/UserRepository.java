package com.example.GreenPath.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.GreenPath.Model.User;
import com.example.GreenPath.Model.UserType;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find by email (used as username in Spring Security)
    Optional<User> findByEmail(String email);

    // Find by phone number
    Optional<User> findByPhoneNumber(String phoneNumber);

    // Find by user type
    List<User> findByUserType(UserType userType);

    // Find by enabled status
    List<User> findByEnabled(boolean enabled);

    // Find by verified status
    List<User> findByVerified(boolean verified);

    // Count by user type
    long countByUserType(UserType userType);

    // Count verified users
    long countByVerifiedTrue();

    // Count enabled users
    long countByEnabledTrue();

    // Find users with recent activity
    List<User> findByLastLoginAfter(LocalDateTime dateTime);

    // Search by name or location
    List<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrLocationContainingIgnoreCase(
        String firstName, String lastName, String location);

    // Find farmers with specific criteria
    @Query("SELECT u FROM User u WHERE u.userType = 'FARMER' AND u.farmSizeHectares >= :minSize")
    List<User> findFarmersByMinimumFarmSize(@Param("minSize") Double minSize);

    // Find herders with specific criteria
    @Query("SELECT u FROM User u WHERE u.userType = 'HERDER' AND u.herdSize >= :minSize")
    List<User> findHerdersByMinimumHerdSize(@Param("minSize") Integer minSize);

    // Find users by location
    List<User> findByLocationContainingIgnoreCase(String location);

    // Find users created within a date range
    List<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find users by farming experience years
    @Query("SELECT u FROM User u WHERE u.userType = 'FARMER' AND u.farmingExperienceYears >= :minYears")
    List<User> findExperiencedFarmers(@Param("minYears") Integer minYears);

    // Find users by herding experience years
    @Query("SELECT u FROM User u WHERE u.userType = 'HERDER' AND u.herdingExperienceYears >= :minYears")
    List<User> findExperiencedHerders(@Param("minYears") Integer minYears);

    // Find users by crop type (for farmers)
    @Query("SELECT u FROM User u WHERE u.userType = 'FARMER' AND u.primaryCrops LIKE %:cropType%")
    List<User> findFarmersByCropType(@Param("cropType") String cropType);

    // Find users by herd type (for herders)
    List<User> findByHerdTypeContainingIgnoreCase(String herdType);

    // Find users in same location
    List<User> findByLocationIgnoreCase(String location);

    // Custom query to get user statistics
    @Query("SELECT COUNT(u), u.userType FROM User u GROUP BY u.userType")
    List<Object[]> getUserStatisticsByType();

    // Find top farmers by farm size
    @Query("SELECT u FROM User u WHERE u.userType = 'FARMER' ORDER BY u.farmSizeHectares DESC")
    List<User> findTopFarmersByFarmSize();

    // Find top herders by herd size
    @Query("SELECT u FROM User u WHERE u.userType = 'HERDER' ORDER BY u.herdSize DESC")
    List<User> findTopHerdersByHerdSize();

    // Check if email exists (for validation)
    boolean existsByEmail(String email);

    // Check if phone number exists (for validation)
    boolean existsByPhoneNumber(String phoneNumber);

    // Find recently registered users
    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC")
    List<User> findRecentlyRegisteredUsers();

    // Find users who haven't logged in for a specific period
    List<User> findByLastLoginBeforeOrLastLoginIsNull(LocalDateTime dateTime);
}