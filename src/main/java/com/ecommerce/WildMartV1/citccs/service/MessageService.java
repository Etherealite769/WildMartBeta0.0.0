package com.ecommerce.WildMartV1.citccs.service;

import com.ecommerce.WildMartV1.citccs.model.Message;
import com.ecommerce.WildMartV1.citccs.model.Order;
import com.ecommerce.WildMartV1.citccs.model.Product;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.MessageRepository;
import com.ecommerce.WildMartV1.citccs.repository.OrderRepository;
import com.ecommerce.WildMartV1.citccs.repository.ProductRepository;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    /**
     * Send a message from sender to receiver
     */
    @Transactional
    public Message sendMessage(Integer senderId, Integer receiverId, String content, Integer productId, Integer orderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (sender.getUserId().equals(receiver.getUserId())) {
            throw new RuntimeException("Cannot send message to yourself");
        }

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setIsRead(false);
        message.setCreatedAt(LocalDateTime.now());

        // Set product if provided
        if (productId != null) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            message.setProduct(product);
        }

        // Set order if provided
        if (orderId != null) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            message.setOrder(order);
        }

        // Generate conversation ID using the same logic as the getter methods
        String conversationId = getDirectConversationId(senderId, receiverId);
        if (productId != null) {
            conversationId = getProductConversationId(senderId, receiverId, productId);
        } else if (orderId != null) {
            conversationId = getOrderConversationId(senderId, receiverId, orderId);
        }
        message.setConversationId(conversationId);

        log.info("Sending message from user {} to user {} with conversationId {}", senderId, receiverId, conversationId);
        return messageRepository.save(message);
    }

    /**
     * Get all conversations for a user
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getConversations(Integer userId) {
        log.info("Fetching conversations for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found for ID: " + userId));

        log.info("Found user: {}", user != null ? user.getEmail() : null);
        
        List<String> conversationIds = messageRepository.findDistinctConversationIdsByUser(user);
        log.info("Found {} conversation IDs for user", conversationIds.size());
        
        if (conversationIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Message> allMessages = messageRepository.findMessagesByConversationIds(conversationIds);
        log.info("Found {} messages in conversations", allMessages.size());
        
        // Filter to get the latest message for each conversation
        Map<String, Message> latestMessagesMap = new LinkedHashMap<>();
        for (Message message : allMessages) {
            String conversationId = message.getConversationId();
            if (!latestMessagesMap.containsKey(conversationId)) {
                latestMessagesMap.put(conversationId, message);
            }
        }
        List<Message> latestMessages = new ArrayList<>(latestMessagesMap.values());
        
        log.info("Filtered to {} latest messages", latestMessages.size());

        return latestMessages.stream().map(message -> {
            Map<String, Object> conversation = new HashMap<>();
            conversation.put("conversationId", message.getConversationId());
            conversation.put("lastMessage", message.getContent());
            conversation.put("lastMessageTime", message.getCreatedAt());
            conversation.put("isRead", message.getIsRead());
            
            // Get the other user in the conversation
            User otherUser = message.getSender().getUserId().equals(userId) 
                    ? message.getReceiver() 
                    : message.getSender();
            
            Map<String, Object> otherUserInfo = new HashMap<>();
            otherUserInfo.put("userId", otherUser.getUserId());
            otherUserInfo.put("username", otherUser.getUsername());
            otherUserInfo.put("fullName", otherUser.getFullName());
            otherUserInfo.put("profileImage", otherUser.getProfileImage());
            conversation.put("otherUser", otherUserInfo);
            
            // Add product info if available
            if (message.getProduct() != null) {
                Map<String, Object> productInfo = new HashMap<>();
                productInfo.put("productId", message.getProduct().getProductId());
                productInfo.put("productName", message.getProduct().getProductName());
                productInfo.put("imageUrl", message.getProduct().getImageUrl());
                conversation.put("product", productInfo);
            }
            
            // Add order info if available
            if (message.getOrder() != null) {
                Map<String, Object> orderInfo = new HashMap<>();
                orderInfo.put("orderId", message.getOrder().getOrderId());
                orderInfo.put("orderNumber", message.getOrder().getOrderNumber());
                conversation.put("order", orderInfo);
            }
            
            return conversation;
        }).collect(Collectors.toList());
    }

    /**
     * Get messages in a conversation
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMessagesInConversation(String conversationId, Integer userId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        
        return messages.stream().map(message -> {
            Map<String, Object> messageMap = new HashMap<>();
            messageMap.put("messageId", message.getMessageId());
            messageMap.put("content", message.getContent());
            messageMap.put("createdAt", message.getCreatedAt());
            messageMap.put("isRead", message.getIsRead());
            messageMap.put("isSender", message.getSender().getUserId().equals(userId));
            
            Map<String, Object> senderInfo = new HashMap<>();
            senderInfo.put("userId", message.getSender().getUserId());
            senderInfo.put("username", message.getSender().getUsername());
            senderInfo.put("fullName", message.getSender().getFullName());
            senderInfo.put("profileImage", message.getSender().getProfileImage());
            messageMap.put("sender", senderInfo);
            
            return messageMap;
        }).collect(Collectors.toList());
    }

    /**
     * Mark messages as read
     */
    @Transactional
    public void markAsRead(String conversationId, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        for (Message message : messages) {
            if (message.getReceiver().getUserId().equals(userId) && !message.getIsRead()) {
                message.setIsRead(true);
                messageRepository.save(message);
            }
        }
    }

    /**
     * Mark all messages as read
     */
    @Transactional
    public void markAllAsRead(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        messageRepository.markAllMessagesAsRead(user);
    }

    /**
     * Get unread message count for a user
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return messageRepository.countUnreadMessagesByUser(user);
    }

    /**
     * Get or create conversation ID for messaging about a product
     */
    public String getProductConversationId(Integer userId, Integer sellerId, Integer productId) {
        int user1 = Math.min(userId, sellerId);
        int user2 = Math.max(userId, sellerId);
        return "conv_" + user1 + "_" + user2 + "_p" + productId;
    }

    /**
     * Get or create conversation ID for messaging about an order
     */
    public String getOrderConversationId(Integer buyerId, Integer sellerId, Integer orderId) {
        int user1 = Math.min(buyerId, sellerId);
        int user2 = Math.max(buyerId, sellerId);
        return "conv_" + user1 + "_" + user2 + "_o" + orderId;
    }

    /**
     * Get or create conversation ID for direct messaging
     */
    public String getDirectConversationId(Integer userId, Integer receiverId) {
        int user1 = Math.min(userId, receiverId);
        int user2 = Math.max(userId, receiverId);
        return "conv_" + user1 + "_" + user2;
    }
}
