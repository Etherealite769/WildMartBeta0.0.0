package com.ecommerce.WildMartV1.citccs.repository;

import com.ecommerce.WildMartV1.citccs.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
