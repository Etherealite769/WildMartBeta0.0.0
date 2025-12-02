package com.ecommerce.WildMartV1.citccs.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String fullName; // Changed from firstName/lastName
    private String phoneNumber; // Changed from phone
    private String shippingAddress; // Changed from address
    private String role; // Added role field (as String)
}
