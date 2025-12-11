package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.config.JwtService;
import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.dto.LikedProductDTO;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import com.ecommerce.WildMartV1.citccs.repository.ReviewRepository; // Add ReviewRepository import
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

    @Autowired
    private ReviewRepository reviewRepository; // Add ReviewRepository autowired

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
        UserDTO updatedUser = userService.updateUserProfile(userId, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getUserProducts(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        List<Product> products = userService.getUserProducts(userId);
        
        // Convert products to map with additional data
        List<Map<String, Object>> productMaps = products.stream().map(product -> {
            Map<String, Object> productMap = new HashMap<>();
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
            productMap.put("reviewCount", reviewRepository.countByProduct(product)); // Add review count
            productMap.put("createdAt", product.getCreatedAt());
            productMap.put("updatedAt", product.getUpdatedAt());
            
            // Add category info
            if (product.getCategory() != null) {
                productMap.put("categoryName", product.getCategory().getCategoryName());
                productMap.put("categoryId", product.getCategory().getId());
            }
            
            // Add seller info
            if (product.getSeller() != null) {
                productMap.put("sellerId", product.getSeller().getUserId());
                productMap.put("sellerName", product.getSeller().getFullName() != null ? 
                    product.getSeller().getFullName() : product.getSeller().getUsername());
                productMap.put("sellerEmail", product.getSeller().getEmail());
            }
            
            return productMap;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(productMaps);
    }

    // Add the missing account endpoints
    @GetMapping("/account")
    public ResponseEntity<UserDTO> getAccountInfo(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        UserDTO user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/account")
    public ResponseEntity<UserDTO> updateAccountInfo(
            @RequestHeader("Authorization") String token,
            @RequestBody UserDTO userDTO) {
        Integer userId = extractUserIdFromToken(token);
        UserDTO updatedUser = userService.updateUserProfile(userId, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    // Add change password endpoint
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        try {
            Integer userId = extractUserIdFromToken(token);
            String newPassword = request.get("newPassword");
            
            if (newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "New password is required"));
            }
            
            userService.changeUserPassword(userId, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            log.error("Error changing password", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to change password: " + e.getMessage()));
        }
    }

    // Add become-seller endpoint
    @PostMapping("/become-seller")
    public ResponseEntity<?> becomeSeller(@RequestHeader("Authorization") String token) {
        try {
            Integer userId = extractUserIdFromToken(token);
            UserDTO updatedUser = userService.becomeSeller(userId);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            log.error("Error becoming seller", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to become seller: " + e.getMessage()));
        }
    }

    // Updated endpoint for paginated liked products
    @GetMapping("/likes")
    public ResponseEntity<Map<String, Object>> getLikedProducts(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Integer userId = extractUserIdFromToken(token);
        
        List<LikedProductDTO> likedProducts = userService.getLikedProductsPaginated(userId, page, size);
        int totalLikes = userService.getLikedProductsCount(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("products", likedProducts);
        response.put("total", totalLikes);
        response.put("page", page);
        response.put("size", size);
        response.put("hasMore", (page + 1) * size < totalLikes);
        
        return ResponseEntity.ok(response);
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
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            return user.getUserId();
        } catch (Exception e) {
            log.error("Error extracting user ID from token", e);
            throw new RuntimeException("Invalid token: " + e.getMessage());
        }
    }
}