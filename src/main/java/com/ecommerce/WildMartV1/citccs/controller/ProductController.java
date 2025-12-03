package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.model.Category;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.dto.ProductDTO; // Import ProductDTO
import com.ecommerce.WildMartV1.citccs.repository.CategoryRepository;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.env.Environment; // Import Environment

import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserService userService; // Keep for other methods if they rely on it

    @Autowired
    private UserRepository userRepository; // Inject UserRepository

    @Autowired
    private Environment env; // Inject Environment

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> productList = products.stream().map(product -> {
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
            // Add category name
            if (product.getCategory() != null) {
                productMap.put("categoryName", product.getCategory().getCategoryName());
            }
            // Add seller info
            if (product.getSeller() != null) {
                productMap.put("sellerName", product.getSeller().getFullName() != null ? product.getSeller().getFullName() : product.getSeller().getUsername());
                productMap.put("sellerEmail", product.getSeller().getEmail());
            }
            return productMap;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(productList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return ResponseEntity.ok(product);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody ProductDTO productDTO) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = authentication.getName();

        User seller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Seller not found with email: " + userEmail));

        Product product = new Product();
        product.setSeller(seller);
        product.setProductName(productDTO.getProductName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setQuantityAvailable(productDTO.getQuantityAvailable());
        product.setStatus("active"); // Default status
        product.setImageUrl(productDTO.getImageUrl()); // Set the image URL from DTO

        // Handle category: Create a dummy Category object to pass to resolveCategory
        Category categoryPayload = new Category();
        categoryPayload.setCategoryName(productDTO.getCategoryName());
        product.setCategory(resolveCategory(categoryPayload));

        Product saved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Integer id,
            @RequestBody Product productDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = authentication.getName();

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getUserId().equals(currentUser.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
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
    // The updateProductMultipart method is removed as it's no longer needed since frontend now sends imageUrl directly.

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Integer id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = authentication.getName();

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getUserId().equals(currentUser.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
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

}
