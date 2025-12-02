package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.config.JwtService;
import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        UserDTO user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody UserDTO userDTO) {
        Integer userId = extractUserIdFromToken(token);
        UserDTO updated = userService.updateUserProfile(userId, userDTO);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/account")
    public ResponseEntity<UserDTO> getAccount(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        UserDTO user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/become-seller")
    public ResponseEntity<?> becomeSeller(@RequestHeader("Authorization") String token) {
        try {
            log.info("Become seller request received with token: {}", token);
            Integer userId = extractUserIdFromToken(token);
            log.info("Extracted userId: {}", userId);
            
            UserDTO userDTO = new UserDTO();
            userDTO.setRole("SELLER");
            UserDTO updated = userService.updateUserProfile(userId, userDTO);
            
            log.info("User {} successfully upgraded to SELLER", userId);
            return ResponseEntity.ok(updated);
        } catch (NumberFormatException e) {
            log.error("Invalid token format", e);
            return ResponseEntity.status(400).body("Invalid token format");
        } catch (Exception e) {
            log.error("Error in become-seller endpoint", e);
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/account")
    public ResponseEntity<UserDTO> updateAccount(
            @RequestHeader("Authorization") String token,
            @RequestBody UserDTO userDTO) {
        try {
            Integer userId = extractUserIdFromToken(token);
            UserDTO updated = userService.updateUserProfile(userId, userDTO);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
    
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getUserProducts(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        List<Product> products = userService.getUserProducts(userId);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/likes")
    public ResponseEntity<Set<Product>> getLikedProducts(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        Set<Product> products = userService.getLikedProducts(userId);
        return ResponseEntity.ok(products);
    }
    
    @PostMapping("/likes/{productId}")
    public ResponseEntity<?> likeProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer productId) {
        Integer userId = extractUserIdFromToken(token);
        userService.likeProduct(userId, productId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/likes/{productId}")
    public ResponseEntity<?> unlikeProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer productId) {
        Integer userId = extractUserIdFromToken(token);
        userService.unlikeProduct(userId, productId);
        return ResponseEntity.ok().build();
    }
    
    // Extract userId from JWT token by getting the email and looking up the user
    private Integer extractUserIdFromToken(String token) {
        try {
            if (token == null || token.isEmpty()) {
                throw new RuntimeException("Token is empty or null");
            }
            
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            log.info("Attempting to extract username from JWT token");
            String email = jwtService.extractUsername(token);
            log.info("Extracted email from token: {}", email);
            
            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Email not found in token");
            }
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            
            log.info("Found user with ID: {}", user.getUserId());
            return user.getUserId();
        } catch (Exception e) {
            log.error("Error extracting userId from token", e);
            throw new RuntimeException("Invalid token: " + e.getMessage(), e);
        }
    }
}
