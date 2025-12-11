package com.ecommerce.WildMartV1.citccs.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class LikedProductDTO {
    private Integer id;
    private Integer productId;
    private String productName;
    private BigDecimal price;
    private Integer quantityAvailable;
    private String imageUrl;
    private String categoryName;
    private String sellerName;
}