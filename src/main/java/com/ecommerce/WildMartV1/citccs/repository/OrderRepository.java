package com.ecommerce.WildMartV1.citccs.repository;

import com.ecommerce.WildMartV1.citccs.model.Order;
import com.ecommerce.WildMartV1.citccs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByBuyer(User buyer);
    List<Order> findByBuyerOrderByOrderDateDesc(User buyer);
    
    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.items oi JOIN FETCH oi.product p JOIN FETCH o.buyer WHERE p.seller = :seller ORDER BY o.orderDate DESC")
    List<Order> findBySellerOrderByOrderDateDesc(@Param("seller") User seller);
    
    @Query("SELECT o FROM Order o JOIN FETCH o.items oi JOIN FETCH oi.product p JOIN FETCH o.buyer WHERE o.orderId = :orderId")
    Optional<Order> findByIdWithBuyerAndItems(@Param("orderId") Integer orderId);
}