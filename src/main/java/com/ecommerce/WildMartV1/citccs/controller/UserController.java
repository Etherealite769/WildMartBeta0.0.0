package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.config.JwtService;
import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.dto.LikedProductDTO;
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
        UserDTO updatedUser = userService.updateUserProfile(userId, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getUserProducts(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        List<Product> products = userService.getUserProducts(userId);
        return ResponseEntity.ok(products);
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