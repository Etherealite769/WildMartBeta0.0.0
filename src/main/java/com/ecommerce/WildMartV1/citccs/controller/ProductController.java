package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.model.Category;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
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
import java.io.IOException; // Import IOException
import java.nio.file.Files; // Import Files
import java.nio.file.Path; // Import Path
import java.nio.file.Paths; // Import Paths
import java.util.UUID; // Import UUID

import org.springframework.web.multipart.MultipartFile; // Import MultipartFile
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
    private UserService userService; // Keep for other methods if they rely on it

    @Autowired
    private UserRepository userRepository; // Inject UserRepository

    @Autowired
    private Environment env; // Inject Environment

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
            @RequestParam("productName") String productName,
            @RequestParam("categoryName") String categoryName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") String price, // Use String to parse BigDecimal manually
            @RequestParam("quantityAvailable") Integer quantityAvailable,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = authentication.getName();

        User seller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Seller not found with email: " + userEmail));

        Product product = new Product();
        product.setSeller(seller);
        product.setProductName(productName);
        product.setDescription(description);
        product.setPrice(new java.math.BigDecimal(price)); // Parse price
        product.setQuantityAvailable(quantityAvailable);
        product.setStatus("active"); // Default status

        // Handle category: Create a dummy Category object to pass to resolveCategory
        Category categoryPayload = new Category();
        categoryPayload.setCategoryName(categoryName);
        product.setCategory(resolveCategory(categoryPayload));

        // Handle image upload (for now, just set the filename as imageUrl)
        if (image != null && !image.isEmpty()) {
            // Save the image file to the uploads directory
            try {
                String uploadDir = "./uploads";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String originalFilename = image.getOriginalFilename();
                String fileExtension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
                Path filePath = uploadPath.resolve(uniqueFileName);
                Files.copy(image.getInputStream(), filePath);

                // Set the imageUrl to the path relative to the static resource handler
                product.setImageUrl("/uploads/" + uniqueFileName);
            } catch (IOException e) {
                System.err.println("Error saving image: " + e.getMessage());
                product.setImageUrl("/placeholder.png"); // Fallback in case of error
            }
        } else {
            product.setImageUrl("/placeholder.png"); // Default or placeholder image
        }

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

    @PutMapping("/{id}/multipart")
    public ResponseEntity<Product> updateProductMultipart(
            @PathVariable Integer id,
            @RequestParam("productName") String productName,
            @RequestParam("categoryName") String categoryName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") String price,
            @RequestParam("quantityAvailable") Integer quantityAvailable,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            System.err.println("Authentication failed: authentication is null or not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = authentication.getName();
        System.out.println("User email from auth: " + userEmail);

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        System.out.println("Current user ID: " + currentUser.getUserId());

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        System.out.println("Product seller ID: " + product.getSeller().getUserId());

        if (!product.getSeller().getUserId().equals(currentUser.getUserId())) {
            System.err.println("User ID mismatch! Product seller: " + product.getSeller().getUserId()
                    + ", Current user: " + currentUser.getUserId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        product.setProductName(productName);
        product.setDescription(description);
        product.setPrice(new java.math.BigDecimal(price));
        product.setQuantityAvailable(quantityAvailable);

        // Handle category
        Category categoryPayload = new Category();
        categoryPayload.setCategoryName(categoryName);
        product.setCategory(resolveCategory(categoryPayload));

        // Handle image upload
        if (image != null && !image.isEmpty()) {
            try {
                String uploadDir = "./uploads";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String originalFilename = image.getOriginalFilename();
                String fileExtension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
                Path filePath = uploadPath.resolve(uniqueFileName);
                Files.copy(image.getInputStream(), filePath);

                product.setImageUrl("/uploads/" + uniqueFileName);
            } catch (IOException e) {
                System.err.println("Error saving image: " + e.getMessage());
                // Keep the existing image URL if upload fails
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
