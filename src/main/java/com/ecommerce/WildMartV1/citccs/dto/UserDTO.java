package com.ecommerce.WildMartV1.citccs.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Integer userId;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String profileImage;
    private String shippingAddress;
    private String paymentInfoEncrypted;
    private String role; // Representing enum as String for DTO
    private Boolean verified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
