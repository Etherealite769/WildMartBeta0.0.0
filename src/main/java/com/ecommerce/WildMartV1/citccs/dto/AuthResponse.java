package com.ecommerce.WildMartV1.citccs.dto;

public class AuthResponse {
    private String token;
    private UserDTO user;
    
    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public UserDTO getUser() {
        return user;
    }
    
    public void setUser(UserDTO user) {
        this.user = user;
    }
}
