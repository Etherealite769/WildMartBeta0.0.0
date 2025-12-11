package com.ecommerce.WildMartV1.citccs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private Integer productId;
    private String productName;
    private String description;
    private BigDecimal price;
    private Integer quantityAvailable;
    private String imageUrl;
    private String status;
    private Integer viewCount;
    private Integer likeCount;
    private Double averageRating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String sellerEmail;
    private String sellerName;
    private String categoryName;
    private Map<String, Object> seller; // Nested seller object with userId, fullName, etc.
}
