package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.model.Cart;
import com.ecommerce.WildMartV1.citccs.model.CartItem;
import com.ecommerce.WildMartV1.citccs.model.Order;
import com.ecommerce.WildMartV1.citccs.model.OrderItem;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.CartRepository;
import com.ecommerce.WildMartV1.citccs.repository.OrderRepository;
import com.ecommerce.WildMartV1.citccs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserService userService;

    @GetMapping("/user/orders")
    public ResponseEntity<List<Order>> getUserOrders(@RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        User user = userService.getUserById(userId);
        List<Order> orders = orderRepository.findByBuyerOrderByOrderDateDesc(user);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/orders/checkout")
    public ResponseEntity<Order> checkout(@RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        User buyer = userService.getUserById(userId);

        Cart cart = cartRepository.findByUser(buyer)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Product firstProduct = cart.getItems().get(0).getProduct();
        User seller = firstProduct.getSeller();

        boolean mixedSellers = cart.getItems().stream()
                .anyMatch(item -> !item.getProduct().getSeller().getId().equals(seller.getId()));
        if (mixedSellers) {
            throw new RuntimeException("Cart contains items from multiple sellers. Please checkout separately.");
        }

        Order order = new Order();
        order.setBuyer(buyer);
        order.setSeller(seller);
        order.setOrderNumber("ORD-" + UUID.randomUUID());
        order.setShippingAddress(buyer.getShippingAddress());

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            BigDecimal unitPrice = cartItem.getPriceAtAddition();
            if (unitPrice == null) {
                unitPrice = cartItem.getProduct().getPrice();
            }
            OrderItem orderItem = new OrderItem(order, cartItem.getProduct(), cartItem.getQuantity(), unitPrice);
            totalAmount = totalAmount.add(orderItem.getSubtotal());
            order.getItems().add(orderItem);
        }
        order.setTotalAmount(totalAmount);

        order = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        return ResponseEntity.ok(order);
    }

    @GetMapping("/user/purchases")
    public ResponseEntity<List<Order>> getPurchases(@RequestHeader("Authorization") String token) {
        Long userId = extractUserIdFromToken(token);
        User user = userService.getUserById(userId);
        List<Order> orders = orderRepository.findByBuyerOrderByOrderDateDesc(user);
        return ResponseEntity.ok(orders);
    }

    private Long extractUserIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        return Long.parseLong(token.replace("token_", ""));
    }
}
