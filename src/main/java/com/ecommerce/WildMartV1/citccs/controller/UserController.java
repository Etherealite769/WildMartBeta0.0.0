package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.config.JwtService;
import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

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
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getUserProducts(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        List<Product> products = userService.getUserProducts(userId);
        
        // Convert Product entities to Maps to avoid serialization issues with lazy-loaded fields
        List<Map<String, Object>> productMaps = products.stream().map(product -> {
            Map<String, Object> productMap = new HashMap<>();
            productMap.put("id", product.getProductId());
            productMap.put("productId", product.getProductId());
            productMap.put("productName", product.getProductName());
            productMap.put("description", product.getDescription());
            productMap.put("price", product.getPrice());
            productMap.put("quantityAvailable", product.getQuantityAvailable());
            productMap.put("imageUrl", product.getImageUrl());
            productMap.put("status", product.getStatus());
            productMap.put("viewCount", product.getViewCount());
            productMap.put("likeCount", product.getLikeCount());
            productMap.put("averageRating", product.getAverageRating());
            productMap.put("createdAt", product.getCreatedAt());
            productMap.put("updatedAt", product.getUpdatedAt());

            // Add category name if available
            if (product.getCategory() != null) {
                productMap.put("categoryName", product.getCategory().getCategoryName());
            }

            // Add seller info if available
            if (product.getSeller() != null) {
                productMap.put("sellerId", product.getSeller().getUserId());
                productMap.put("sellerName",
                        product.getSeller().getFullName() != null ? product.getSeller().getFullName()
                                : product.getSeller().getUsername());
                productMap.put("sellerEmail", product.getSeller().getEmail());
            }

            return productMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(productMaps);
    }

    @GetMapping("/likes")
    public ResponseEntity<Set<Map<String, Object>>> getLikedProducts(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        Set<Product> products = userService.getLikedProducts(userId);

        // Convert Product entities to Maps to avoid serialization issues
        Set<Map<String, Object>> productMaps = products.stream().map(product -> {
            Map<String, Object> productMap = new HashMap<>();
            productMap.put("id", product.getProductId());
            productMap.put("productId", product.getProductId());
            productMap.put("productName", product.getProductName());
            productMap.put("description", product.getDescription());
            productMap.put("price", product.getPrice());
            productMap.put("quantityAvailable", product.getQuantityAvailable());
            productMap.put("imageUrl", product.getImageUrl());
            productMap.put("status", product.getStatus());
            productMap.put("viewCount", product.getViewCount());
            productMap.put("likeCount", product.getLikeCount());
            productMap.put("averageRating", product.getAverageRating());
            productMap.put("createdAt", product.getCreatedAt());
            productMap.put("updatedAt", product.getUpdatedAt());

            // Add category name if available
            if (product.getCategory() != null) {
                productMap.put("categoryName", product.getCategory().getCategoryName());
            }

            // Add seller info if available
            if (product.getSeller() != null) {
                productMap.put("sellerName",
                        product.getSeller().getFullName() != null ? product.getSeller().getFullName()
                                : product.getSeller().getUsername());
                productMap.put("sellerEmail", product.getSeller().getEmail());
            }

            return productMap;
        }).collect(Collectors.toSet());

        return ResponseEntity.ok(productMaps);
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
                token = token.substring(7); // Remove "Bearer " prefix
            }

            // Decode JWT token to get user email
            String email = jwtService.extractUsername(token);
            log.info("Extracted email from token: {}", email);

            // Look up user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            return user.getUserId();
        } catch (Exception e) {
            log.error("Error extracting userId from token", e);
            throw new RuntimeException("Invalid token: " + e.getMessage());
        }
    }
}