package com.ecommerce.WildMartV1.citccs.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Data
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_at_addition", nullable = false, precision = 15, scale = 2)
    private BigDecimal priceAtAddition;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    public CartItem() {
    }

    public CartItem(Cart cart, Product product, Integer quantity, BigDecimal priceAtAddition) {
        this.cart = cart;
        this.product = product;
        this.quantity = quantity;
        this.priceAtAddition = priceAtAddition;
    }

    @PrePersist
    public void onCreate() {
        this.addedAt = LocalDateTime.now();
        if (priceAtAddition == null && product != null) {
            this.priceAtAddition = product.getPrice();
        }
    }
}
