package com.ecommerce.WildMartV1.citccs.repository;

import com.ecommerce.WildMartV1.citccs.model.Order;
import com.ecommerce.WildMartV1.citccs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyer(User buyer);
    List<Order> findByBuyerOrderByOrderDateDesc(User buyer);
    List<Order> findBySellerOrderByOrderDateDesc(User seller);
}
