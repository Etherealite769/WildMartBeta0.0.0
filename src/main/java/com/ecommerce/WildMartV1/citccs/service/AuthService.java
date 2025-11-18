package com.ecommerce.WildMartV1.citccs.service;

import com.ecommerce.WildMartV1.citccs.config.JwtService;
import com.ecommerce.WildMartV1.citccs.dto.AuthResponse;
import com.ecommerce.WildMartV1.citccs.dto.LoginRequest;
import com.ecommerce.WildMartV1.citccs.dto.SignupRequest;
import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Cart;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.CartRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public AuthResponse register(SignupRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        // Create new user with all provided information
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFirstName() + " " + request.getLastName());
        user.setPhoneNumber(request.getPhone());
        user.setShippingAddress(request.getAddress());
        
        user = userRepository.save(user);
        
        // Create cart for user
        Cart cart = new Cart(user);
        cartRepository.save(cart);
        
        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());
        
        return new AuthResponse(token, convertToDTO(user));
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());
        
        return new AuthResponse(token, convertToDTO(user));
    }
    
    public boolean validateToken(String token) {
        try {
            String username = jwtService.extractUsername(token);
            Optional<User> user = userRepository.findByEmail(username);
            return user.isPresent() && jwtService.validateToken(token, username);
        } catch (Exception e) {
            return false;
        }
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setProfileImage(user.getProfileImage());
        dto.setShippingAddress(user.getShippingAddress());
        dto.setPaymentInfoEncrypted(user.getPaymentInfoEncrypted());
        dto.setVerified(user.getVerified());
        dto.setBio(user.getBio());
        return dto;
    }
}
