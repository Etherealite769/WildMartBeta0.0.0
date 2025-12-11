package com.ecommerce.WildMartV1.citccs.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@ToString(exclude = {"sender", "receiver", "product", "order"})
@EqualsAndHashCode(of = "messageId")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Integer messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"products", "ordersPlaced", "cart", "likes", "reviews", "passwordHash"})
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    @JsonIgnoreProperties({"products", "ordersPlaced", "cart", "likes", "reviews", "passwordHash"})
    private User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"seller", "category", "orderItems", "likes", "reviews"})
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnoreProperties({"buyer", "items", "voucher"})
    private Order order;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "conversation_id", nullable = false)
    private String conversationId;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (conversationId == null) {
            // Generate conversation ID based on users (smaller ID first for consistency)
            int user1 = Math.min(sender.getUserId(), receiver.getUserId());
            int user2 = Math.max(sender.getUserId(), receiver.getUserId());
            conversationId = "conv_" + user1 + "_" + user2;
            if (product != null) {
                conversationId += "_p" + product.getProductId();
            }
            if (order != null) {
                conversationId += "_o" + order.getOrderId();
            }
        }
    }
}
