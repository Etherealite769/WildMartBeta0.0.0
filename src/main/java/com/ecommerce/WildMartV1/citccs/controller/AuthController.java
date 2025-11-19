package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.dto.AuthResponse;
import com.ecommerce.WildMartV1.citccs.dto.LoginRequest;
import com.ecommerce.WildMartV1.citccs.dto.SignupRequest;
import com.ecommerce.WildMartV1.citccs.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody SignupRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (authService.validateToken(token)) {
                    return ResponseEntity.ok(Collections.singletonMap("message", "Token is valid"));
                }
            }
            return ResponseEntity.status(401).body(Collections.singletonMap("error", "Invalid or expired token"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Collections.singletonMap("error", "Invalid token"));
        }
    }
}
