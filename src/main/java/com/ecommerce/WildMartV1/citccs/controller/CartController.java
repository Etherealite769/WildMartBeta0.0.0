package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.model.Cart;
import com.ecommerce.WildMartV1.citccs.model.CartItem;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.CartItemRepository;
import com.ecommerce.WildMartV1.citccs.repository.CartRepository;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CartController {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    
    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestHeader("Authorization") String token) {
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
        return ResponseEntity.ok(cart);
    }
    
    @PostMapping("/add")
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
            cartItem.setCart(cart); // Ensure bidirectional relationship is set
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            cartItem.setPriceAtAddition(product.getPrice());
        }

        cartRepository.save(cart);
        
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateCartItem(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer itemId,
            @RequestBody Map<String, Integer> request) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        Integer quantity = request.get("quantity");
        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
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
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return Integer.parseInt(token.replace("token_", ""));
    }
}
