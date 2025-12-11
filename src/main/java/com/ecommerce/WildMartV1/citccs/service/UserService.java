package com.ecommerce.WildMartV1.citccs.service;

import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.dto.LikedProductDTO;
import com.ecommerce.WildMartV1.citccs.model.Like;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.LikeRepository;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final LikeRepository likeRepository;
    private final PasswordEncoder passwordEncoder;

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
    
    // Add changeUserPassword method
    public void changeUserPassword(Integer userId, String newPassword) {
        User user = getUserById(userId);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", userId);
    }
    
    // Add becomeSeller method
    public UserDTO becomeSeller(Integer userId) {
        User user = getUserById(userId);
        user.setRole(User.Role.SELLER);
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);
        log.info("User {} became a seller", userId);
        return convertToDTO(user);
    }

    public List<Product> getUserProducts(Integer userId) {
        log.info("Attempting to retrieve products for userId: {}", userId);
        User user = getUserById(userId);
        // Use query that eagerly fetches category and seller to avoid lazy loading issues
        List<Product> products = productRepository.findBySellerWithCategoryAndSeller(user);
        log.info("Found {} products for user: {}", products.size(), userId);
        return products;
    }

    public Set<Product> getLikedProducts(Integer userId) {
        User user = getUserById(userId);
        return user.getLikes().stream()
                .map(Like::getProduct)
                .collect(Collectors.toCollection(HashSet::new));
    }
    
    // New method to get paginated liked products with lightweight DTOs
    public List<LikedProductDTO> getLikedProductsPaginated(Integer userId, int page, int size) {
        User user = getUserById(userId);
        
        return user.getLikes().stream()
                .skip((long) page * size)
                .limit(size)
                .map(like -> {
                    Product product = like.getProduct();
                    LikedProductDTO dto = new LikedProductDTO();
                    dto.setId(product.getProductId());
                    dto.setProductId(product.getProductId());
                    dto.setProductName(product.getProductName());
                    dto.setPrice(product.getPrice());
                    dto.setQuantityAvailable(product.getQuantityAvailable());
                    dto.setImageUrl(product.getImageUrl());
                    
                    if (product.getCategory() != null) {
                        dto.setCategoryName(product.getCategory().getCategoryName());
                    }
                    
                    if (product.getSeller() != null) {
                        dto.setSellerName(
                            product.getSeller().getFullName() != null ? 
                            product.getSeller().getFullName() : 
                            product.getSeller().getUsername()
                        );
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    // New method to get total count of liked products
    public int getLikedProductsCount(Integer userId) {
        User user = getUserById(userId);
        return user.getLikes().size();
    }

    @Transactional
    public void likeProduct(Integer userId, Integer productId) {
        User user = getUserById(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already liked using repository
        if (!likeRepository.existsByUserAndProduct(user, product)) {
            Like like = new Like(user, product);
            likeRepository.save(like);

            // Update like count
            product.setLikeCount(product.getLikeCount() + 1);
            productRepository.save(product);

            log.info("User {} liked product {}", userId, productId);
        } else {
            log.info("User {} already liked product {}", userId, productId);
        }
    }

    @Transactional
    public void unlikeProduct(Integer userId, Integer productId) {
        User user = getUserById(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if the like exists before attempting to delete
        if (likeRepository.existsByUserAndProduct(user, product)) {
            // Delete the like using repository
            likeRepository.deleteByUserAndProduct(user, product);

            // Update like count (ensure it doesn't go below 0)
            product.setLikeCount(Math.max(0, product.getLikeCount() - 1));
            productRepository.save(product);

            log.info("User {} unliked product {}", userId, productId);
        } else {
            log.info("User {} has not liked product {}, no action taken", userId, productId);
        }
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