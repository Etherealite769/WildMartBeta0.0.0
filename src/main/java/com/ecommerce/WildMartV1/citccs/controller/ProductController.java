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
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
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
        // Use optimized query to fetch products with seller and category in one query
        List<Product> products = productRepository.findAllWithSellerAndCategory();
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
                productMap.put("sellerName",
                        product.getSeller().getFullName() != null ? product.getSeller().getFullName()
                                : product.getSeller().getUsername());
                productMap.put("sellerEmail", product.getSeller().getEmail());
            }
            return productMap;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(productList);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Integer id) {
        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

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
        productMap.put("createdAt", product.getCreatedAt());
        productMap.put("updatedAt", product.getUpdatedAt());

        // Add category info
        if (product.getCategory() != null) {
            productMap.put("categoryName", product.getCategory().getCategoryName());
            productMap.put("categoryId", product.getCategory().getId());
        }

        // Add seller info - important for ownership verification
        if (product.getSeller() != null) {
            Map<String, Object> sellerMap = new HashMap<>();
            sellerMap.put("userId", product.getSeller().getUserId());
            sellerMap.put("fullName", product.getSeller().getFullName());
            sellerMap.put("username", product.getSeller().getUsername());
            sellerMap.put("email", product.getSeller().getEmail());
            sellerMap.put("profileImage", product.getSeller().getProfileImage());
            sellerMap.put("rating", 0); // Default rating
            productMap.put("seller", sellerMap);

            // Keep legacy fields for backward compatibility
            productMap.put("sellerId", product.getSeller().getUserId());
            productMap.put("sellerName", product.getSeller().getFullName() != null ? product.getSeller().getFullName()
                    : product.getSeller().getUsername());
            productMap.put("sellerEmail", product.getSeller().getEmail());
        }

        return ResponseEntity.ok(productMap);
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
    @Transactional
    public ResponseEntity<?> updateProduct(
            @PathVariable Integer id,
            @RequestBody ProductDTO productDTO) {
        log.info("Updating product with id: {}", id);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authName = authentication != null ? authentication.getName() : null;
        log.info("Authentication name: {}", authName);

        // Check if user is properly authenticated (not anonymous)
        if (authentication == null || authName == null || "anonymousUser".equals(authName)) {
            log.warn("Unauthorized access attempt for product update: {}", id);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated", "message", "Please log in to update products"));
        }
        String userEmail = authName;

        User currentUser = userRepository.findByEmail(userEmail)
                .orElse(null);

        if (currentUser == null) {
            log.warn("User not found with email: {}", userEmail);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not found", "message", "User with email " + userEmail + " not found"));
        }
        log.info("Current user: {} (ID: {})", currentUser.getEmail(), currentUser.getUserId());

        Product product = productRepository.findByIdWithSeller(id)
                .orElse(null);

        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found", "message", "Product with id " + id + " not found"));
        }

        Integer sellerId = product.getSeller() != null ? product.getSeller().getUserId() : null;
        log.info("Product seller ID: {}, Current user ID: {}", sellerId, currentUser.getUserId());

        if (sellerId == null || !sellerId.equals(currentUser.getUserId())) {
            log.warn("User {} (ID: {}) attempted to update product {} owned by seller ID: {}",
                    userEmail, currentUser.getUserId(), id, sellerId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Permission denied",
                            "message", "You can only update your own products",
                            "yourUserId", currentUser.getUserId(),
                            "productSellerId", sellerId != null ? sellerId : "null"));
        }

        // Update product fields from DTO
        if (productDTO.getProductName() != null) {
            product.setProductName(productDTO.getProductName());
        }
        if (productDTO.getDescription() != null) {
            product.setDescription(productDTO.getDescription());
        }
        if (productDTO.getPrice() != null) {
            product.setPrice(productDTO.getPrice());
        }
        if (productDTO.getCategoryName() != null) {
            Category categoryPayload = new Category();
            categoryPayload.setCategoryName(productDTO.getCategoryName());
            product.setCategory(resolveCategory(categoryPayload));
        }
        if (productDTO.getImageUrl() != null) {
            product.setImageUrl(productDTO.getImageUrl());
        }
        if (productDTO.getQuantityAvailable() != null) {
            product.setQuantityAvailable(productDTO.getQuantityAvailable());
        }
        if (productDTO.getStatus() != null) {
            product.setStatus(productDTO.getStatus());
        }

        Product updated = productRepository.save(product);
        log.info("Product {} updated successfully", id);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/multipart")
    @Transactional
    public ResponseEntity<?> updateProductMultipart(
            @PathVariable Integer id,
            @RequestParam("productName") String productName,
            @RequestParam("categoryName") String categoryName,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("quantityAvailable") Integer quantityAvailable,
            @RequestParam("status") String status,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = authentication.getName();

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findByIdWithSeller(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Update product fields
        product.setProductName(productName);
        product.setDescription(description);
        product.setPrice(java.math.BigDecimal.valueOf(price));
        product.setQuantityAvailable(quantityAvailable);
        product.setStatus(status);

        // Handle category
        Category categoryPayload = new Category();
        categoryPayload.setCategoryName(categoryName);
        product.setCategory(resolveCategory(categoryPayload));

        // Handle image upload if provided
        if (image != null && !image.isEmpty()) {
            try {
                String baseUrl = env.getProperty("supabase.public.url");
                String bucketName = "product-images";
                String fileName = image.getOriginalFilename();
                String imageUrl = String.format("%s/storage/v1/object/public/%s/%s", baseUrl, bucketName, fileName);
                product.setImageUrl(imageUrl);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Failed to process image: " + e.getMessage());
            }
        }

        Product updated = productRepository.save(product);
        return ResponseEntity.ok(updated);
    }

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

        Product product = productRepository.findByIdWithSeller(id)
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
