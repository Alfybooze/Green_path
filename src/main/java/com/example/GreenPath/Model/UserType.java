package com.example.GreenPath.Model;


public enum UserType {
    FARMER("Farmer"),
    HERDER("Herder"),
    ADMIN("Admin");  // Add this line
    
    private final String displayName;
    
    UserType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}