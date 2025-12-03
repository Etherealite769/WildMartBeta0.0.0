package com.ecommerce.WildMartV1.citccs.service;

import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Like;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    
    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public UserDTO getUserProfile(Integer userId) {
        User user = getUserById(userId);
        return convertToDTO(user);
    }
    
    public UserDTO updateUserProfile(Integer userId, UserDTO userDTO) {
        User user = getUserById(userId);
        
        if (userDTO.getUsername() != null) {
            user.setUsername(userDTO.getUsername());
        }
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }
        if (userDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(userDTO.getPhoneNumber());
        }
        if (userDTO.getProfileImage() != null) {
            user.setProfileImage(userDTO.getProfileImage());
        }
        if (userDTO.getShippingAddress() != null) {
            user.setShippingAddress(userDTO.getShippingAddress());
        }
        if (userDTO.getPaymentInfoEncrypted() != null) {
            user.setPaymentInfoEncrypted(userDTO.getPaymentInfoEncrypted());
        }
        if (userDTO.getRole() != null) {
            try {
                user.setRole(User.Role.valueOf(userDTO.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                log.error("Invalid role provided: {}", userDTO.getRole());
                throw new RuntimeException("Invalid role: " + userDTO.getRole());
            }
        }
        if (userDTO.getVerified() != null) {
            user.setVerified(userDTO.getVerified());
        }
        
        user = userRepository.save(user);
        return convertToDTO(user);
    }
    
    public List<Product> getUserProducts(Integer userId) {
        log.info("Attempting to retrieve products for userId: {}", userId);
        User user = getUserById(userId);
        List<Product> products = productRepository.findBySeller(user);
        log.info("Found {} products for user: {}", products.size(), userId);
        return products;
    }
    
    public Set<Product> getLikedProducts(Integer userId) {
        User user = getUserById(userId);
        return user.getLikes().stream()
                .map(Like::getProduct)
                .collect(Collectors.toCollection(HashSet::new));
    }
    
    public void likeProduct(Integer userId, Integer productId) {
        User user = getUserById(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean alreadyLiked = user.getLikes().stream()
                .anyMatch(like -> like.getProduct().getProductId().equals(productId));

        if (!alreadyLiked) {
            Like like = new Like(user, product);
            user.getLikes().add(like);
            product.getLikes().add(like);
            userRepository.save(user);
            productRepository.save(product);
        }
    }

    public void unlikeProduct(Integer userId, Integer productId) {
        User user = getUserById(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        user.getLikes().removeIf(like -> like.getProduct().getProductId().equals(productId));
        product.getLikes().removeIf(like -> like.getUser().getUserId().equals(userId));
        userRepository.save(user);
        productRepository.save(product);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setProfileImage(user.getProfileImage());
        dto.setShippingAddress(user.getShippingAddress());
        dto.setPaymentInfoEncrypted(user.getPaymentInfoEncrypted());
        dto.setRole(user.getRole().name()); // Convert Enum to String
        dto.setVerified(user.getVerified());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
