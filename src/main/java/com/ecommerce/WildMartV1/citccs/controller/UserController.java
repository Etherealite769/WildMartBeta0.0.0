package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        UserDTO user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @RequestHeader("Authorization") String token,
            @RequestBody UserDTO userDTO) {
        Long userId = extractUserIdFromToken(token);
        UserDTO updated = userService.updateUserProfile(userId, userDTO);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/account")
    public ResponseEntity<UserDTO> getAccount(@RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        UserDTO user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/account")
    public ResponseEntity<UserDTO> updateAccount(
            @RequestHeader("Authorization") String token,
            @RequestBody UserDTO userDTO) {
        Long userId = extractUserIdFromToken(token);
        UserDTO updated = userService.updateUserProfile(userId, userDTO);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getUserProducts(@RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        List<Product> products = userService.getUserProducts(userId);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/likes")
    public ResponseEntity<Set<Product>> getLikedProducts(@RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        Set<Product> products = userService.getLikedProducts(userId);
        return ResponseEntity.ok(products);
    }
    
    @PostMapping("/likes/{productId}")
    public ResponseEntity<?> likeProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long productId) {
        Long userId = extractUserIdFromToken(token);
        userService.likeProduct(userId, productId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/likes/{productId}")
    public ResponseEntity<?> unlikeProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long productId) {
        Long userId = extractUserIdFromToken(token);
        userService.unlikeProduct(userId, productId);
        return ResponseEntity.ok().build();
    }
    
    // Simplified token extraction - in production use JWT
    private Long extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return Long.parseLong(token.replace("token_", ""));
    }
}
