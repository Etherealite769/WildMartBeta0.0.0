package com.ecommerce.WildMartV1.citccs.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderDTO {
    private Integer orderId;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String orderStatus;
    private String paymentStatus;
    private String shippingAddress;
    private LocalDateTime orderDate;
    private LocalDateTime updatedAt;
    private List<OrderItemDTO> items = new ArrayList<>();
    private UserDTO buyer; // Add buyer information
    
    // Constructors
    public OrderDTO() {}
    
    // Getters and setters
    public Integer getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getOrderStatus() {
        return orderStatus;
    }
    
    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }
    
    public String getPaymentStatus() {
        return paymentStatus;
    }
    
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    
    public String getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
    
    public LocalDateTime getOrderDate() {
        return orderDate;
    }
    
    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<OrderItemDTO> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }
    
    public UserDTO getBuyer() {
        return buyer;
    }
    
    public void setBuyer(UserDTO buyer) {
        this.buyer = buyer;
    }
}