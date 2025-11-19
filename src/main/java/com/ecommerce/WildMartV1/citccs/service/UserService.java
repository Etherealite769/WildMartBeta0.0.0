package com.ecommerce.WildMartV1.citccs.service;

import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Like;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public User getUserById(long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public UserDTO getUserProfile(long userId) {
        User user = getUserById(userId);
        return convertToDTO(user);
    }
    
    public UserDTO updateUserProfile(long userId, UserDTO userDTO) {
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
        if (userDTO.getVerified() != null) {
            user.setVerified(userDTO.getVerified());
        }
        if (userDTO.getBio() != null) {
            user.setBio(userDTO.getBio());
        }
        
        user = userRepository.save(user);
        return convertToDTO(user);
    }
    
    public List<Product> getUserProducts(long userId) {
        User user = getUserById(userId);
        return productRepository.findBySeller(user);
    }
    
    public Set<Product> getLikedProducts(long userId) {
        User user = getUserById(userId);
        return user.getLikes().stream()
                .map(Like::getProduct)
                .collect(Collectors.toCollection(HashSet::new));
    }
    
    public void likeProduct(long userId, long productId) {
        User user = getUserById(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean alreadyLiked = user.getLikes().stream()
                .anyMatch(like -> like.getProduct().getId() == productId);

        if (!alreadyLiked) {
            Like like = new Like(user, product);
            user.getLikes().add(like);
            product.getLikes().add(like);
            userRepository.save(user);
            productRepository.save(product);
        }
    }

    public void unlikeProduct(long userId, long productId) {
        User user = getUserById(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        user.getLikes().removeIf(like -> like.getProduct().getId().equals(productId));
        product.getLikes().removeIf(like -> like.getUser().getId().equals(userId));
        userRepository.save(user);
        productRepository.save(product);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setProfileImage(user.getProfileImage());
        dto.setShippingAddress(user.getShippingAddress());
        dto.setPaymentInfoEncrypted(user.getPaymentInfoEncrypted());
        dto.setVerified(user.getVerified());
        dto.setBio(user.getBio());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
