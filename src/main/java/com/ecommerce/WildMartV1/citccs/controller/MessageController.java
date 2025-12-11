package com.ecommerce.WildMartV1.citccs.controller;

import com.ecommerce.WildMartV1.citccs.model.Message;
import com.ecommerce.WildMartV1.citccs.model.User;
import com.ecommerce.WildMartV1.citccs.repository.UserRepository;
import com.ecommerce.WildMartV1.citccs.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    /**
     * Send a new message
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            log.info("Received message send request: {}", request);
            
            if (authentication == null) {
                log.error("Authentication is null");
                return ResponseEntity.badRequest().body(Map.of("error", "Not authenticated"));
            }
            
            // Get user from authentication principal
            User sender;
            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                sender = (User) principal;
            } else {
                // Fallback: try to find by email
                String email = authentication.getName();
                log.info("Principal is not User, trying to find by email: {}", email);
                sender = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
            }
            
            log.info("Sender: {} (ID: {})", sender.getEmail(), sender.getUserId());

            // Handle numeric types properly (JSON numbers may come as Long or Integer)
            Integer receiverId = parseInteger(request.get("receiverId"));
            String content = (String) request.get("content");
            Integer productId = parseInteger(request.get("productId"));
            Integer orderId = parseInteger(request.get("orderId"));
            
            log.info("Parsed values - receiverId: {}, productId: {}, orderId: {}, content length: {}", 
                    receiverId, productId, orderId, content != null ? content.length() : 0);

            if (receiverId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Receiver ID is required"));
            }
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message content is required"));
            }

            Message message = messageService.sendMessage(
                    sender.getUserId(),
                    receiverId,
                    content.trim(),
                    productId,
                    orderId
            );

            Map<String, Object> response = new HashMap<>();
            response.put("messageId", message.getMessageId());
            response.put("conversationId", message.getConversationId());
            response.put("content", message.getContent());
            response.put("createdAt", message.getCreatedAt());
            response.put("success", true);
            
            log.info("Message sent successfully with ID: {}", message.getMessageId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    private Integer parseInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Long) return ((Long) value).intValue();
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
    
    private User getUserFromAuth(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        } else {
            String email = authentication.getName();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
    }

    /**
     * Get all conversations for the current user
     */
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication authentication) {
        try {
            User user = getUserFromAuth(authentication);
            List<Map<String, Object>> conversations = messageService.getConversations(user.getUserId());
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            log.error("Error fetching conversations: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get messages in a specific conversation
     */
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<?> getConversation(
            @PathVariable String conversationId,
            Authentication authentication) {
        try {
            User user = getUserFromAuth(authentication);

            List<Map<String, Object>> messages = messageService.getMessagesInConversation(
                    conversationId,
                    user.getUserId()
            );

            // Mark messages as read
            messageService.markAsRead(conversationId, user.getUserId());

            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            log.error("Error fetching conversation: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get unread message count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            User user = getUserFromAuth(authentication);
            Long count = messageService.getUnreadCount(user.getUserId());
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            log.error("Error fetching unread count: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark messages as read in a conversation
     */
    @PostMapping("/mark-read/{conversationId}")
    public ResponseEntity<?> markAsRead(
            @PathVariable String conversationId,
            Authentication authentication) {
        try {
            User user = getUserFromAuth(authentication);
            messageService.markAsRead(conversationId, user.getUserId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Error marking messages as read: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get conversation ID for messaging about a product
     */
    @GetMapping("/product-conversation/{productId}/seller/{sellerId}")
    public ResponseEntity<?> getProductConversationId(
            @PathVariable Integer productId,
            @PathVariable Integer sellerId,
            Authentication authentication) {
        try {
            User user = getUserFromAuth(authentication);

            String conversationId = messageService.getProductConversationId(
                    user.getUserId(),
                    sellerId,
                    productId
            );

            return ResponseEntity.ok(Map.of("conversationId", conversationId));
        } catch (Exception e) {
            log.error("Error getting product conversation ID: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
