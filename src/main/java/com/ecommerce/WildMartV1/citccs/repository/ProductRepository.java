package com.ecommerce.WildMartV1.citccs.repository;

import com.ecommerce.WildMartV1.citccs.model.Category;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findBySeller(User seller);
    List<Product> findByCategory(Category category);
    List<Product> findByProductNameContainingIgnoreCase(String name);
    List<Product> findByStatus(String status);
    
    @Query("SELECT p FROM Product p JOIN FETCH p.seller WHERE p.productId = :id")
    Optional<Product> findByIdWithSeller(@Param("id") Integer id);
}
