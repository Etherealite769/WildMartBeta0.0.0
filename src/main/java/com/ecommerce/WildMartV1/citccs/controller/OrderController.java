package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.config.JwtService;
import com.ecommerce.WildMartV1.citccs.model.Cart;
import com.ecommerce.WildMartV1.citccs.model.CartItem;
import com.ecommerce.WildMartV1.citccs.model.Order;
import com.ecommerce.WildMartV1.citccs.model.OrderItem;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.CartRepository;
import com.ecommerce.WildMartV1.citccs.repository.OrderRepository;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @GetMapping("/user/orders")
    public ResponseEntity<List<Order>> getUserOrders(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        User user = userService.getUserById(userId);
        List<Order> orders = orderRepository.findByBuyerOrderByOrderDateDesc(user);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/orders/checkout")
    @Transactional
    public ResponseEntity<?> checkout(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> checkoutData) {
        try {
            Integer userId = extractUserIdFromToken(token);
            User buyer = userService.getUserById(userId);

            Cart cart = cartRepository.findByUser(buyer)
                    .orElseThrow(() -> new RuntimeException("Cart not found"));

            if (cart.getItems().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cart is empty"));
            }

            // Validate stock availability
            for (CartItem cartItem : cart.getItems()) {
                Product product = cartItem.getProduct();
                if (product.getQuantityAvailable() < cartItem.getQuantity()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                "error", "Insufficient stock for product: " + product.getProductName(),
                                "productName", product.getProductName(),
                                "available", product.getQuantityAvailable(),
                                "requested", cartItem.getQuantity()
                            ));
                }
            }

            // Create order
            Order order = new Order();
            order.setBuyer(buyer);
            order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            
            // Get shipping address from request or use user's default
            String shippingAddress = checkoutData.get("shippingAddress");
            if (shippingAddress == null || shippingAddress.trim().isEmpty()) {
                shippingAddress = buyer.getShippingAddress();
            }
            order.setShippingAddress(shippingAddress);
            
            // Set payment method from request
            String paymentMethod = checkoutData.getOrDefault("paymentMethod", "Cash on Delivery");
            
            // Set order status
            order.setOrderStatus("Pending");
            order.setPaymentStatus("Pending");

            // Calculate total and create order items
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (CartItem cartItem : cart.getItems()) {
                Product product = cartItem.getProduct();
                
                // Use price at addition or current price
                BigDecimal unitPrice = cartItem.getPriceAtAddition();
                if (unitPrice == null) {
                    unitPrice = product.getPrice();
                }
                
                // Create order item
                OrderItem orderItem = new OrderItem(order, product, cartItem.getQuantity(), unitPrice);
                totalAmount = totalAmount.add(orderItem.getSubtotal());
                order.getItems().add(orderItem);
                
                // Update product stock
                product.setQuantityAvailable(product.getQuantityAvailable() - cartItem.getQuantity());
                productRepository.save(product);
            }
            
            order.setTotalAmount(totalAmount);
            order.setOrderDate(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            // Save order
            order = orderRepository.save(order);

            // Clear cart
            cart.getItems().clear();
            cartRepository.save(cart);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.getOrderId());
            response.put("orderNumber", order.getOrderNumber());
            response.put("totalAmount", order.getTotalAmount());
            response.put("orderStatus", order.getOrderStatus());
            response.put("paymentStatus", order.getPaymentStatus());
            response.put("shippingAddress", order.getShippingAddress());
            response.put("paymentMethod", paymentMethod);
            response.put("message", "Order placed successfully");

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error during checkout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Checkout failed: " + e.getMessage()));
        }
    }

    @GetMapping("/user/purchases")
    public ResponseEntity<List<Order>> getPurchases(@RequestHeader("Authorization") String token) {
        Integer userId = extractUserIdFromToken(token);
        User user = userService.getUserById(userId);
        List<Order> orders = orderRepository.findByBuyerOrderByOrderDateDesc(user);
        return ResponseEntity.ok(orders);
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
