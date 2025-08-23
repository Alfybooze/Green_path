package com.example.GreenPath.Controller;


import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.GreenPath.Model.User;
import com.example.GreenPath.Model.UserType;

import jakarta.servlet.http.HttpSession;

@Controller
public class WebController {



    // Home/Landing page
    @GetMapping("/")
    public String home() {
        return "home";
    }

    @GetMapping("/home")
    public String landing() {
        return "home";
    }

    // Login page
    @GetMapping("/login")
    public String showLoginPage(Model model) {
        model.addAttribute("user", new User());
        return "login";
    }



    // Signup page
    @GetMapping("/signup")
    public String showSignupPage(Model model, @RequestParam(value = "username", required = false) String username) {
        model.addAttribute("user", new User());
        if (username != null) {
            model.addAttribute("existingUsername", username);
        }
        return "signup";
    }



    // Role-specific dashboards
    @GetMapping("/admin/dashboard")
    public String adminDashboard(HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("loggedInUser");
        String userRole = (String) session.getAttribute("userRole");
        
        if (loggedInUser == null || !"admin".equalsIgnoreCase(userRole)) {
            return "redirect:/login";
        }
        
        model.addAttribute("user", loggedInUser);
        model.addAttribute("role", userRole);
        return "admin/dashboard";
    }

    @GetMapping("/farmer/dashboard")
    public String farmerDashboard(HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("loggedInUser");
        
        if (loggedInUser == null || loggedInUser.getUserType() != UserType.FARMER) {
            return "redirect:/login";
        }
        
        model.addAttribute("user", loggedInUser);
        model.addAttribute("role", loggedInUser.getUserType().getDisplayName());
        return "farmer/dashboard";
    }

     @GetMapping("/herder/dashboard")
    public String herderDashboard(HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("loggedInUser");
        
        if (loggedInUser == null || loggedInUser.getUserType() != UserType.HERDER) {
            return "redirect:/login";
        }
        
        model.addAttribute("user", loggedInUser);
        model.addAttribute("role", loggedInUser.getUserType().getDisplayName());
        return "herder/dashboard";
    }

    // Logout
   @GetMapping("/logout")
    public String logout(HttpSession session, RedirectAttributes redirectAttributes) {
        session.invalidate();
        redirectAttributes.addFlashAttribute("success", "You have been logged out successfully");
        return "redirect:/home";
    }

    // Profile page
    @GetMapping("/profile")
    public String profile(HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("loggedInUser");
        
        if (loggedInUser == null) {
            return "redirect:/login";
        }
        
        model.addAttribute("user", loggedInUser);
        return "profile";
    }

    // Error page
    @GetMapping("/error")
    public String error() {
        return "error";
    }

    // About page
    @GetMapping("/about")
    public String about() {
        return "about";
    }

    // Contact page
    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }
}