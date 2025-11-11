package com.ecommerce.WildMartV1.citccs.service;

import com.ecommerce.WildMartV1.citccs.dto.UserDTO;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public UserDTO getUserProfile(Long userId) {
        User user = getUserById(userId);
        return convertToDTO(user);
    }
    
    public UserDTO updateUserProfile(Long userId, UserDTO userDTO) {
        User user = getUserById(userId);
        
        if (userDTO.getUsername() != null) {
            user.setUsername(userDTO.getUsername());
        }
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getPhone() != null) {
            user.setPhone(userDTO.getPhone());
        }
        if (userDTO.getAddress() != null) {
            user.setAddress(userDTO.getAddress());
        }
        if (userDTO.getCity() != null) {
            user.setCity(userDTO.getCity());
        }
        if (userDTO.getZipCode() != null) {
            user.setZipCode(userDTO.getZipCode());
        }
        if (userDTO.getCountry() != null) {
            user.setCountry(userDTO.getCountry());
        }
        if (userDTO.getBio() != null) {
            user.setBio(userDTO.getBio());
        }
        
        user = userRepository.save(user);
        return convertToDTO(user);
    }
    
    public List<Product> getUserProducts(Long userId) {
        User user = getUserById(userId);
        return productRepository.findByUser(user);
    }
    
    public Set<Product> getLikedProducts(Long userId) {
        User user = getUserById(userId);
        return user.getLikedProducts();
    }
    
    public void likeProduct(Long userId, Long productId) {
        User user = getUserById(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        user.getLikedProducts().add(product);
        userRepository.save(user);
    }
    
    public void unlikeProduct(Long userId, Long productId) {
        User user = getUserById(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        user.getLikedProducts().remove(product);
        userRepository.save(user);
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setZipCode(user.getZipCode());
        dto.setCountry(user.getCountry());
        dto.setBio(user.getBio());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setRating(user.getRating());
        dto.setProductCount(user.getProductCount());
        dto.setSalesCount(user.getSalesCount());
        return dto;
    }
}
