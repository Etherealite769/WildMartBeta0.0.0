package com.ecommerce.WildMartV1.citccs.repository;

import com.ecommerce.WildMartV1.citccs.model.Review;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByUserAndProduct(User user, Product product);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product = :product")
    Double getAverageRatingByProduct(@Param("product") Product product);
    
    List<Review> findByProduct(Product product);
    
    // Add method to count reviews for a product
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product = :product")
    int countByProduct(@Param("product") Product product);
}