package com.ecommerce.WildMartV1.citccs.service;

import com.ecommerce.WildMartV1.citccs.dto.AuthResponse;
import com.ecommerce.WildMartV1.citccs.dto.LoginRequest;
import com.ecommerce.WildMartV1.citccs.dto.SignupRequest;
import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Cart;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.CartRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CartRepository cartRepository;
    
    public AuthResponse register(SignupRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In production, hash the password
        
        user = userRepository.save(user);
        
        // Create cart for user
        Cart cart = new Cart(user);
        cartRepository.save(cart);
        
        // Generate token (simplified - in production use JWT)
        String token = "token_" + user.getId();
        
        return new AuthResponse(token, convertToDTO(user));
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        // In production, verify hashed password
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // Generate token (simplified - in production use JWT)
        String token = "token_" + user.getId();
        
        return new AuthResponse(token, convertToDTO(user));
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setZipCode(user.getZipCode());
        dto.setCountry(user.getCountry());
        dto.setBio(user.getBio());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setRating(user.getRating());
        dto.setProductCount(user.getProductCount());
        dto.setSalesCount(user.getSalesCount());
        return dto;
    }
}
