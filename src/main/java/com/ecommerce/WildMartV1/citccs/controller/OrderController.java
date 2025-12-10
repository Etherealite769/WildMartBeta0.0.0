package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.dto.OrderDTO;
import com.ecommerce.WildMartV1.citccs.dto.OrderItemDTO;
import com.ecommerce.WildMartV1.citccs.dto.ProductDTO;
import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Cart;
import com.ecommerce.WildMartV1.citccs.model.CartItem;
import com.ecommerce.WildMartV1.citccs.model.Category;
import com.ecommerce.WildMartV1.citccs.model.Order;
import com.ecommerce.WildMartV1.citccs.model.OrderItem;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.model.Voucher;
import com.ecommerce.WildMartV1.citccs.repository.CartRepository;
import com.ecommerce.WildMartV1.citccs.repository.OrderRepository;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import com.ecommerce.WildMartV1.citccs.repository.VoucherRepository;
import com.ecommerce.WildMartV1.citccs.config.JwtService;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;

    @GetMapping("/user/orders/{orderId}")
    public ResponseEntity<?> getOrderById(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer orderId) {
        try {
            Integer userId = extractUserIdFromToken(token);
            User user = userService.getUserById(userId);

            // Use findByIdWithBuyerAndItems to ensure all relationships are loaded
            Order order = orderRepository.findByIdWithBuyerAndItems(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Verify that the order belongs to the user (buyer)
            if (!order.getBuyer().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Unauthorized access to this order"));
            }

            // Convert to DTO to avoid serialization issues
            OrderDTO orderDTO = convertToDTO(order);

            return ResponseEntity.ok(orderDTO);
        } catch (Exception e) {
            log.error("Error fetching order details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch order: " + e.getMessage()));
        }
    }

    @GetMapping("/user/sales/{orderId}")
    public ResponseEntity<?> getSaleById(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer orderId) {
        try {
            Integer userId = extractUserIdFromToken(token);
            User user = userService.getUserById(userId);

            // Use findByIdWithBuyerAndItems to ensure all relationships are loaded
            Order order = orderRepository.findByIdWithBuyerAndItems(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Verify that the order contains products sold by the user
            boolean hasProductsFromSeller = order.getItems().stream()
                    .anyMatch(item -> item.getProduct().getSeller().getUserId().equals(userId));

            if (!hasProductsFromSeller) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Unauthorized access to this order"));
            }

            // Convert to DTO to avoid serialization issues
            OrderDTO orderDTO = convertToDTO(order);

            return ResponseEntity.ok(orderDTO);
        } catch (Exception e) {
            log.error("Error fetching sale details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch sale: " + e.getMessage()));
        }
    }

    @GetMapping("/user/orders")
    public ResponseEntity<?> getUserOrders(Authentication authentication) {
        try {
            log.info("Received request for user orders");

            if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
                log.warn("Authentication is null or principal is not a User");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            User user = (User) authentication.getPrincipal();
            log.info("Successfully fetched user: {} (ID: {})", user.getEmail(), user.getUserId());

            List<Order> orders = orderRepository.findByBuyerOrderByOrderDateDesc(user);
            log.info("Found {} orders for user", orders.size());

            // Convert to DTOs to avoid serialization issues
            List<OrderDTO> orderDTOs = new ArrayList<>();
            for (Order order : orders) {
                orderDTOs.add(convertToDTO(order));
            }

            return ResponseEntity.ok(orderDTOs);
        } catch (Exception e) {
            log.error("Error fetching user orders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch orders: " + e.getMessage()));
        }
    }

    @GetMapping("/user/sales")
    public ResponseEntity<?> getUserSales(@RequestHeader("Authorization") String token) {
        try {
            log.info("Received request for user sales");

            Integer userId = extractUserIdFromToken(token);
            User user = userService.getUserById(userId);
            log.info("Successfully fetched user: {} (ID: {})", user.getEmail(), user.getUserId());

            List<Order> orders = orderRepository.findBySellerOrderByOrderDateDesc(user);
            log.info("Found {} sales for user", orders.size());

            // Convert to DTOs to avoid serialization issues
            List<OrderDTO> orderDTOs = new ArrayList<>();
            for (Order order : orders) {
                orderDTOs.add(convertToDTO(order));
            }

            return ResponseEntity.ok(orderDTOs);
        } catch (Exception e) {
            log.error("Error fetching user sales: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch sales: " + e.getMessage()));
        }
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

            // Get selected item IDs from request, if provided
            List<Long> selectedItemIds = new ArrayList<>();
            String selectedItemIdsStr = checkoutData.get("selectedItemIds");
            if (selectedItemIdsStr != null && !selectedItemIdsStr.isEmpty()) {
                try {
                    // Parse comma-separated item IDs
                    String[] ids = selectedItemIdsStr.split(",");
                    for (String id : ids) {
                        selectedItemIds.add(Long.parseLong(id.trim()));
                    }
                } catch (NumberFormatException e) {
                    log.warn("Invalid item IDs format: {}", selectedItemIdsStr);
                }
            }

            // Log for debugging
            log.info("Selected item IDs: {}", selectedItemIds);

            // Log all cart item IDs for comparison
            log.info("All cart item IDs:");
            for (CartItem item : cart.getItems()) {
                log.info("  Cart item ID: {}, Product: {}", item.getId(), item.getProduct().getProductName());
            }

            // Filter cart items to only include selected items (if any selected)
            List<CartItem> itemsToProcess = cart.getItems();
            if (!selectedItemIds.isEmpty()) {
                log.info("Filtering items - looking for {} selected items", selectedItemIds.size());
                itemsToProcess = cart.getItems().stream()
                        .filter(item -> {
                            boolean matches = selectedItemIds.contains(item.getId());
                            log.info("CartItem ID {} matches selection: {}", item.getId(), matches);
                            return matches;
                        })
                        .collect(Collectors.toList());

                // Only check for empty itemsToProcess if we were trying to filter
                // If no items match the filter, that's an error
                if (itemsToProcess.isEmpty()) {
                    log.warn("No selected items found in cart after filtering");
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "No selected items found in cart"));
                }
                log.info("Filtered to {} items for processing", itemsToProcess.size());
            }
            // If selectedItemIds is empty, we process all items (backward compatibility)

            log.info("Items to process count: {}", itemsToProcess.size());

            // Validate stock availability for items to process
            for (CartItem cartItem : itemsToProcess) {
                Product product = cartItem.getProduct();
                if (product.getQuantityAvailable() < cartItem.getQuantity()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of(
                                    "error", "Insufficient stock for product: " + product.getProductName(),
                                    "productName", product.getProductName(),
                                    "available", product.getQuantityAvailable(),
                                    "requested", cartItem.getQuantity()));
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
            order.setPaymentStatus("Completed");

            // Calculate total and create order items
            BigDecimal totalAmount = BigDecimal.ZERO;
            List<OrderItem> orderItems = new ArrayList<>();

            for (CartItem cartItem : itemsToProcess) {
                Product product = cartItem.getProduct();

                // Use price at addition or current price
                BigDecimal unitPrice = cartItem.getPriceAtAddition();
                if (unitPrice == null) {
                    unitPrice = product.getPrice();
                }

                // Create order item
                OrderItem orderItem = new OrderItem(order, product, cartItem.getQuantity(), unitPrice);
                totalAmount = totalAmount.add(orderItem.getSubtotal());
                orderItems.add(orderItem);

                // Update product stock
                product.setQuantityAvailable(product.getQuantityAvailable() - cartItem.getQuantity());
                productRepository.save(product);
            }

            // Set order items
            order.setItems(orderItems);

            // Calculate shipping fee (5% of subtotal)
            BigDecimal shippingFee = totalAmount.multiply(BigDecimal.valueOf(0.05));

            // Apply voucher discount if provided
            String voucherCode = checkoutData.get("voucherCode");
            BigDecimal discountAmount = BigDecimal.ZERO;
            if (voucherCode != null && !voucherCode.trim().isEmpty()) {
                Optional<Voucher> voucherOpt = voucherRepository.findByDiscountCode(voucherCode.trim());
                if (voucherOpt.isPresent()) {
                    Voucher voucher = voucherOpt.get();

                    // Validate voucher
                    if (!voucher.getIsActive()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "This voucher is no longer active"));
                    }

                    if (voucher.getValidFrom().isAfter(LocalDateTime.now())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "This voucher is not yet valid"));
                    }

                    if (voucher.getValidUntil().isBefore(LocalDateTime.now())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "This voucher has expired"));
                    }

                    if (voucher.getUsageLimit() != null &&
                            voucher.getUsageCount() >= voucher.getUsageLimit()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "This voucher has reached its usage limit"));
                    }

                    if (voucher.getMinimumOrderAmount() != null &&
                            totalAmount.compareTo(voucher.getMinimumOrderAmount()) < 0) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Minimum order amount not met for this voucher"));
                    }

                    // Apply discount based on type
                    switch (voucher.getDiscountType()) {
                        case PERCENTAGE:
                            discountAmount = totalAmount.multiply(voucher.getDiscountValue())
                                    .divide(BigDecimal.valueOf(100));
                            break;
                        case FIXED_AMOUNT:
                            discountAmount = voucher.getDiscountValue();
                            break;
                        case SHIPPING:
                            // Free shipping discount
                            discountAmount = shippingFee;
                            break;
                    }

                    // Ensure discount doesn't exceed total amount + shipping
                    BigDecimal maxDiscount = totalAmount.add(shippingFee);
                    if (discountAmount.compareTo(maxDiscount) > 0) {
                        discountAmount = maxDiscount;
                    }

                    // Set the voucher on the order
                    order.setDiscount(voucher);

                    // Increment usage count
                    voucher.setUsageCount(voucher.getUsageCount() + 1);
                    voucherRepository.save(voucher);
                } else {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid voucher code"));
                }
            }

            // Add shipping fee to total, then apply discount
            totalAmount = totalAmount.add(shippingFee).subtract(discountAmount);
            order.setTotalAmount(totalAmount);
            order.setOrderDate(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            // Save order
            order = orderRepository.save(order);

            // Remove processed items from cart (instead of clearing entire cart)
            if (!selectedItemIds.isEmpty()) {
                // Only remove selected items
                log.info("Removing {} selected items from cart", selectedItemIds.size());
                cart.getItems().removeIf(item -> {
                    boolean shouldRemove = selectedItemIds.contains(item.getId());
                    log.info("CartItem ID {} will be removed: {}", item.getId(), shouldRemove);
                    return shouldRemove;
                });
            } else {
                // If no items were specifically selected, clear the entire cart
                log.info("Clearing entire cart");
                cart.getItems().clear();
            }
            cartRepository.save(cart);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.getOrderId());
            response.put("orderNumber", order.getOrderNumber());
            response.put("subtotal", totalAmount.subtract(shippingFee).add(discountAmount)); // Original subtotal
            response.put("shippingFee", shippingFee);
            response.put("discountAmount", discountAmount);
            response.put("totalAmount", order.getTotalAmount());
            response.put("orderStatus", order.getOrderStatus());
            response.put("paymentStatus", order.getPaymentStatus());
            response.put("shippingAddress", order.getShippingAddress());
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
            log.info("Extracting userId from token. Original token: {}",
                    token != null && token.length() > 7 ? token.substring(0, 7) + "***" : "null or empty");

            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                log.info("Removed Bearer prefix. New token: {}",
                        token != null && token.length() > 7 ? token.substring(0, 7) + "***" : "null or empty");
            }

            // Add extra validation for empty or null token
            if (token == null || token.isEmpty()) {
                log.warn("Token is missing or empty");
                throw new RuntimeException("Token is missing or empty");
            }

            log.info("Attempting to extract username from token");
            String email = jwtService.extractUsername(token);
            log.info("Extracted email: {}", email);

            // Add validation for extracted email
            if (email == null || email.isEmpty()) {
                log.warn("Invalid token: email not found");
                throw new RuntimeException("Invalid token: email not found");
            }

            log.info("Looking up user by email: {}", email);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.warn("User not found for email: {}", email);
                        return new RuntimeException("User not found with email: " + email);
                    });
            log.info("Found user with ID: {}", user.getUserId());
            return user.getUserId();
        } catch (Exception e) {
            log.error("Error extracting userId from token: {}", e.getMessage(), e);
            throw new RuntimeException("Invalid token: " + e.getMessage(), e);
        }
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setOrderStatus(order.getOrderStatus());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setDeliveryConfirmationImage(order.getDeliveryConfirmationImage());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setOrderDate(order.getOrderDate());
        dto.setUpdatedAt(order.getUpdatedAt());

        // Convert buyer information
        User buyer = order.getBuyer();
        if (buyer != null) {
            UserDTO buyerDTO = new UserDTO();
            buyerDTO.setUserId(buyer.getUserId());
            buyerDTO.setUsername(buyer.getUsername());
            buyerDTO.setEmail(buyer.getEmail());
            buyerDTO.setFullName(buyer.getFullName());
            dto.setBuyer(buyerDTO);
        }

        // Convert order items
        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setUnitPrice(item.getUnitPrice());
            itemDTO.setSubtotal(item.getSubtotal());

            // Convert product to DTO
            Product product = item.getProduct();
            if (product != null) {
                ProductDTO productDTO = new ProductDTO();
                productDTO.setProductId(product.getProductId());
                productDTO.setProductName(product.getProductName());
                productDTO.setDescription(product.getDescription());
                productDTO.setPrice(product.getPrice());
                productDTO.setQuantityAvailable(product.getQuantityAvailable());
                productDTO.setImageUrl(product.getImageUrl());
                productDTO.setStatus(product.getStatus());
                productDTO.setViewCount(product.getViewCount());
                productDTO.setLikeCount(product.getLikeCount());
                productDTO.setAverageRating(product.getAverageRating());
                productDTO.setCreatedAt(product.getCreatedAt());
                productDTO.setUpdatedAt(product.getUpdatedAt());

                // Set seller information
                User seller = product.getSeller();
                if (seller != null) {
                    productDTO.setSellerEmail(seller.getEmail());
                    productDTO
                            .setSellerName(seller.getFullName() != null ? seller.getFullName() : seller.getUsername());
                }

                // Set category information
                Category category = product.getCategory();
                if (category != null) {
                    productDTO.setCategoryName(category.getCategoryName());
                }

                itemDTO.setProduct(productDTO);
            }

            itemDTOs.add(itemDTO);
        }
        dto.setItems(itemDTOs);

        return dto;
    }

    @PutMapping("/user/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            Integer userId = extractUserIdFromToken(token);
            User user = userService.getUserById(userId);

            // Find the order
            Order order = orderRepository.findByIdWithBuyerAndItems(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Verify that the order belongs to the user (buyer)
            if (!order.getBuyer().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Unauthorized access to this order"));
            }

            // Only allow status updates from "Pending" to "Cancelled"
            String newStatus = statusUpdate.get("orderStatus");
            if (!"Pending".equals(order.getOrderStatus())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot cancel order that is not in Pending status"));
            }

            if (!"Cancelled".equals(newStatus)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid status update. Only cancellation is allowed."));
            }

            // Update order status
            order.setOrderStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());

            // Save the updated order
            order = orderRepository.save(order);

            // Convert to DTO to avoid serialization issues
            OrderDTO orderDTO = convertToDTO(order);

            return ResponseEntity.ok(Map.of(
                    "message", "Order status updated successfully",
                    "order", orderDTO));
        } catch (Exception e) {
            log.error("Error updating order status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update order status: " + e.getMessage()));
        }
    }

    @PutMapping("/user/sales/{orderId}/mark-delivered")
    public ResponseEntity<?> markOrderAsDelivered(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer orderId,
            @RequestParam(required = false) String deliveryConfirmationImage) {
        try {
            Integer userId = extractUserIdFromToken(token);
            User user = userService.getUserById(userId);

            // Find the order
            Order order = orderRepository.findByIdWithBuyerAndItems(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            // Verify that the order contains products sold by the user
            boolean hasProductsFromSeller = order.getItems().stream()
                    .anyMatch(item -> item.getProduct().getSeller().getUserId().equals(userId));

            if (!hasProductsFromSeller) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Unauthorized access to this order"));
            }

            // Update order status to "Delivered"
            order.setOrderStatus("Delivered");

            // Set delivery confirmation image if provided
            if (deliveryConfirmationImage != null && !deliveryConfirmationImage.isEmpty()) {
                order.setDeliveryConfirmationImage(deliveryConfirmationImage);
            }

            // Save the updated order
            order = orderRepository.save(order);

            // Convert to DTO to avoid serialization issues
            OrderDTO orderDTO = convertToDTO(order);

            return ResponseEntity.ok(Map.of(
                    "message", "Order marked as delivered successfully",
                    "order", orderDTO));
        } catch (Exception e) {
            log.error("Error marking order as delivered", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark order as delivered: " + e.getMessage()));
        }
    }
}