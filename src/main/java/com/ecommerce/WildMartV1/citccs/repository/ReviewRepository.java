package com.ecommerce.WildMartV1.citccs.repository;

import com.ecommerce.WildMartV1.citccs.model.Review;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUser(User user);
    List<Review> findByProduct(Product product);
    
    @Query("SELECT r FROM Review r WHERE r.user = :user AND r.product = :product")
    Optional<Review> findByUserAndProduct(@Param("user") User user, @Param("product") Product product);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product = :product")
    Double getAverageRatingByProduct(@Param("product") Product product);
}