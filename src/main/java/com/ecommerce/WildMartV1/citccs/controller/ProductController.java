package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.model.Category;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.CategoryRepository;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestHeader("Authorization") String token,
            @RequestBody Product product) {
        Integer userId = extractUserIdFromToken(token);
        User seller = userService.getUserById(userId);
        product.setSeller(seller);
        product.setCategory(resolveCategory(product.getCategory()));
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer id,
            @RequestBody Product productDetails) {
        Integer userId = extractUserIdFromToken(token);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        product.setProductName(productDetails.getProductName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        if (productDetails.getCategory() != null) {
            product.setCategory(resolveCategory(productDetails.getCategory()));
        }
        product.setImageUrl(productDetails.getImageUrl());
        if (productDetails.getQuantityAvailable() != null) {
            product.setQuantityAvailable(productDetails.getQuantityAvailable());
        }
        if (productDetails.getStatus() != null) {
            product.setStatus(productDetails.getStatus());
        }

        Product updated = productRepository.save(product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer id) {
        Integer userId = extractUserIdFromToken(token);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        productRepository.delete(product);
        return ResponseEntity.ok().build();
    }

    private Category resolveCategory(Category categoryPayload) {
        if (categoryPayload == null) {
            return null;
        }
        if (categoryPayload.getId() != null) {
            return categoryRepository.findById(categoryPayload.getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }
        if (categoryPayload.getCategoryName() != null
                && categoryRepository.existsByCategoryNameIgnoreCase(categoryPayload.getCategoryName())) {
            return categoryRepository.findAll().stream()
                    .filter(cat -> categoryPayload.getCategoryName().equalsIgnoreCase(cat.getCategoryName()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }
        return categoryRepository.save(categoryPayload);
    }

    private Integer extractUserIdFromToken(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Authorization token is required");
        }
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return Integer.parseInt(token.replace("token_", ""));
    }
}
