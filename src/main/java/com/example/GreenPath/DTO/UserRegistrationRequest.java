package com.example.GreenPath.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRegistrationRequest {
    
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    
    @Email(message = "Please provide a valid email address")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;
    
    private String phoneNumber;
    
    @NotBlank(message = "User type is required")
    private String userType; // "FARMER" or "HERDER"
    
    private String location;
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
    
    // Farmer-specific fields
    private String farmName;
    private Double farmSizeHectares;
    private String primaryCrops;
    private Integer farmingExperienceYears;
    
    // Herder-specific fields
    private String herdType;
    private Integer herdSize;
    private String grazingArea;
    private Integer herdingExperienceYears;
    
    // This field is used in your controller validation but not in User model
    // You might want to remove this or use firstName instead
    private String username;
}