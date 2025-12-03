package com.ecommerce.WildMartV1.citccs.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "products")
@Getter
@Setter
@ToString(exclude = {"seller", "category", "orderItems", "likes", "reviews", "cartItems"})
@EqualsAndHashCode(of = "productId")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonBackReference // Add this annotation
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonBackReference // Add this annotation for category relationship
    private Category category;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "quantity_available", nullable = false)
    private Integer quantityAvailable; // Removed default initialization

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private String status; // Removed default initialization

    @Column(name = "view_count", nullable = false)
    private Integer viewCount; // Removed default initialization

    @Column(name = "like_count", nullable = false)
    private Integer likeCount; // Removed default initialization

    @Column(name = "average_rating")
    private Double averageRating; // Removed default initialization

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Removed default initialization

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // Removed default initialization

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.viewCount == null) this.viewCount = 0;
        if (this.likeCount == null) this.likeCount = 0;
        if (this.averageRating == null) this.averageRating = 0.0;
        if (this.status == null) this.status = "active"; // Set default if not provided
        if (this.quantityAvailable == null) this.quantityAvailable = 0; // Set default if not provided
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Like> likes = new HashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<CartItem> cartItems = new HashSet<>();

}
