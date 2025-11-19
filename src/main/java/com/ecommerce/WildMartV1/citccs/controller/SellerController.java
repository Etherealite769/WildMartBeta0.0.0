package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sellers")
@CrossOrigin(origins = "http://localhost:3000")
public class SellerController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getSellerInfo(@PathVariable Long id) {
        UserDTO seller = userService.getUserProfile(id);
        return ResponseEntity.ok(seller);
    }
    
    @GetMapping("/{id}/products")
    public ResponseEntity<List<Product>> getSellerProducts(@PathVariable Long id) {
        List<Product> products = userService.getUserProducts(id);
        return ResponseEntity.ok(products);
    }
}
