package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.config.JwtService;
import com.ecommerce.WildMartV1.citccs.model.Cart;
import com.ecommerce.WildMartV1.citccs.model.CartItem;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.CartItemRepository;
import com.ecommerce.WildMartV1.citccs.repository.CartRepository;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getCart(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        User user = userService.getUserById(userId);
        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setCreatedAt(LocalDateTime.now());
                    newCart.setUpdatedAt(LocalDateTime.now());
                    newCart.setStatus("active");
                    return cartRepository.save(newCart);
                });

        // Convert cart items to include product details
        List<Map<String, Object>> items = cart.getItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("id", item.getId());
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("priceAtAddition", item.getPriceAtAddition());
            itemMap.put("addedAt", item.getAddedAt());

            // Add product details
            Product product = item.getProduct();
            if (product != null) {
                Map<String, Object> productMap = new HashMap<>();
                productMap.put("productId", product.getProductId());
                productMap.put("productName", product.getProductName());
                productMap.put("price", product.getPrice());
                productMap.put("imageUrl", product.getImageUrl());
                productMap.put("quantityAvailable", product.getQuantityAvailable());

                // Add seller details
                User seller = product.getSeller();
                if (seller != null) {
                    Map<String, Object> sellerMap = new HashMap<>();
                    sellerMap.put("userId", seller.getUserId());
                    sellerMap.put("username", seller.getUsername());
                    sellerMap.put("email", seller.getEmail());
                    sellerMap.put("fullName", seller.getFullName());
                    productMap.put("seller", sellerMap);
                }

                itemMap.put("product", productMap);
            }

            return itemMap;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("cartId", cart.getCartId());
        response.put("items", items);
        response.put("status", cart.getStatus());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addToCart(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> request) {
        Integer userId = extractUserIdFromToken(token);
        User user = userService.getUserById(userId);

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setCreatedAt(LocalDateTime.now());
                    newCart.setUpdatedAt(LocalDateTime.now());
                    newCart.setStatus("active");
                    return cartRepository.save(newCart);
                });

        Integer productId = Integer.parseInt(request.get("productId").toString());
        Integer quantity = Integer.parseInt(request.get("quantity").toString());

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        if (cartItem == null) {
            cartItem = new CartItem(cart, product, quantity, product.getPrice());
            cart.getItems().add(cartItem);
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItem.setPriceAtAddition(product.getPrice());
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product added to cart successfully");
        response.put("cartItemCount", cart.getItems().size());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/items/{itemId}")
    @Transactional
    public ResponseEntity<?> updateCartItem(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer itemId,
            @RequestBody Map<String, Integer> request) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        Integer quantity = request.get("quantity");
        if (quantity == null || quantity < 0) {
            throw new RuntimeException("Quantity cannot be negative");
        }

        // If quantity is 0, remove the item from cart
        if (quantity == 0) {
            cartItemRepository.deleteById(itemId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Item removed from cart");
            return ResponseEntity.ok(response);
        }

        // Validate stock availability
        Product product = item.getProduct();
        if (product.getQuantityAvailable() < quantity) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Only " + product.getQuantityAvailable() + " item" +
                    (product.getQuantityAvailable() != 1 ? "s" : "") + " available in stock");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeCartItem(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer itemId) {
        cartItemRepository.deleteById(itemId);
        return ResponseEntity.ok().build();
    }

    private Integer extractUserIdFromToken(String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            String email = jwtService.extractUsername(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            return user.getUserId();
        } catch (Exception e) {
            log.error("Error extracting userId from token", e);
            throw new RuntimeException("Invalid token: " + e.getMessage(), e);
        }
    }
}
