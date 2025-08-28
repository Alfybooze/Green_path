package com.example.GreenPath.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.GreenPath.Model.User;
import com.example.GreenPath.Model.UserType;
import com.example.GreenPath.Service.userService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/user")
public class User_Controller {

    @Autowired
    private userService userService;

       @PostMapping("/signup")
    public String processSignup(@RequestParam("username") String username,
                               @RequestParam("email") String email,
                               @RequestParam("password") String password,
                               @RequestParam("firstName") String firstName,
                               @RequestParam("lastName") String lastName,
                               @RequestParam("role") String role,
                               @RequestParam(value = "changeRole", required = false) String changeRole,
                               RedirectAttributes redirectAttributes) {
        try {
            // Convert string role to UserType enum
            UserType userType;
            try {
                userType = UserType.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                redirectAttributes.addFlashAttribute("error", "Invalid role selected");
                return "redirect:/signup";
            }
            
            // Check if user already exists (by email since that's the username)
            User existingUser = userService.findByEmail(email);
            
            if (existingUser != null) {
                if (changeRole == null || !changeRole.equals("yes")) {
                    // User exists and didn't confirm role change
                    redirectAttributes.addFlashAttribute("existingUser", true);
                    redirectAttributes.addFlashAttribute("existingUsername", email);
                    redirectAttributes.addFlashAttribute("existingRoles", existingUser.getUserType().name());
                    redirectAttributes.addFlashAttribute("info", 
                        "User already exists with role: " + existingUser.getUserType().name() + 
                        ". Do you want to change roles?");
                    return "redirect:/signup?username=" + email;
                } else {
                    // User confirmed role change
                    existingUser.setUserType(userType);
                    User updatedUser = userService.updateUser(existingUser);
                    if (updatedUser != null) {
                        redirectAttributes.addFlashAttribute("success", 
                            "Role updated successfully! You can now login with your new role.");
                        return "redirect:/login";
                    } else {
                        redirectAttributes.addFlashAttribute("error", "Failed to update role.");
                        return "redirect:/signup";
                    }
                }
            }

            // Create new user
            User newUser = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(password) // Note: This should be encoded in the service
                .userType(userType)
                .enabled(true)
                .verified(false)
                .build();
            
            User savedUser = userService.saveUser(newUser);
            
            if (savedUser != null) {
                redirectAttributes.addFlashAttribute("success", "Registration successful! Please login.");
                return "redirect:/login";
            } else {
                redirectAttributes.addFlashAttribute("error", "Registration failed. Please try again.");
                return "redirect:/signup";
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Registration failed: " + e.getMessage());
            return "redirect:/signup";
        }
    }
       @PostMapping("/profile/update")
    public String updateProfile(@ModelAttribute("user") User user, 
                               HttpSession session, 
                               RedirectAttributes redirectAttributes) {
        User loggedInUser = (User) session.getAttribute("loggedInUser");
        
        if (loggedInUser == null) {
            return "redirect:/login";
        }
        
        try {
            user.setId(loggedInUser.getId());
            User updatedUser = userService.updateUser(user);
            session.setAttribute("loggedInUser", updatedUser);
            redirectAttributes.addFlashAttribute("success", "Profile updated successfully");
            return "redirect:/profile";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Profile update failed: " + e.getMessage());
            return "redirect:/profile";
        }
    }
}