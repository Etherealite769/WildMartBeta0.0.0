package com.ecommerce.WildMartV1.citccs.repository;

import com.ecommerce.WildMartV1.citccs.model.Message;
import com.ecommerce.WildMartV1.citccs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {

    // Find all messages in a conversation
    @Query("SELECT m FROM Message m " +
           "LEFT JOIN FETCH m.sender " +
           "LEFT JOIN FETCH m.receiver " +
           "LEFT JOIN FETCH m.product " +
           "LEFT JOIN FETCH m.order " +
           "WHERE m.conversationId = :conversationId " +
           "ORDER BY m.createdAt ASC")
    List<Message> findByConversationIdOrderByCreatedAtAsc(@Param("conversationId") String conversationId);

    // Find all conversations for a user
    @Query("SELECT DISTINCT m.conversationId FROM Message m " +
           "WHERE m.sender = :user OR m.receiver = :user " +
           "ORDER BY m.createdAt DESC")
    List<String> findDistinctConversationIdsByUser(@Param("user") User user);

    // Find the latest message in each conversation for a user
    @Query("SELECT m FROM Message m " +
           "LEFT JOIN FETCH m.sender " +
           "LEFT JOIN FETCH m.receiver " +
           "LEFT JOIN FETCH m.product " +
           "LEFT JOIN FETCH m.order " +
           "WHERE m.conversationId IN :conversationIds " +
           "AND m.createdAt = (" +
           "  SELECT MAX(m2.createdAt) FROM Message m2 WHERE m2.conversationId = m.conversationId" +
           ")")
    List<Message> findLatestMessagesByConversationIds(@Param("conversationIds") List<String> conversationIds);

    // Count unread messages for a user
    @Query("SELECT COUNT(m) FROM Message m " +
           "WHERE m.receiver = :user AND m.isRead = false")
    Long countUnreadMessagesByUser(@Param("user") User user);

    // Mark messages as read in a conversation
    @Query("UPDATE Message m SET m.isRead = true " +
           "WHERE m.conversationId = :conversationId AND m.receiver = :user")
    void markMessagesAsRead(@Param("conversationId") String conversationId, @Param("user") User user);

    // Find messages between two users about a specific product
    @Query("SELECT m FROM Message m " +
           "LEFT JOIN FETCH m.sender " +
           "LEFT JOIN FETCH m.receiver " +
           "LEFT JOIN FETCH m.product " +
           "WHERE ((m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1)) " +
           "AND m.product.productId = :productId " +
           "ORDER BY m.createdAt ASC")
    List<Message> findMessagesBetweenUsersAboutProduct(
        @Param("user1") User user1, 
        @Param("user2") User user2, 
        @Param("productId") Integer productId
    );

    // Find messages between two users about a specific order
    @Query("SELECT m FROM Message m " +
           "LEFT JOIN FETCH m.sender " +
           "LEFT JOIN FETCH m.receiver " +
           "LEFT JOIN FETCH m.order " +
           "WHERE ((m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1)) " +
           "AND m.order.orderId = :orderId " +
           "ORDER BY m.createdAt ASC")
    List<Message> findMessagesBetweenUsersAboutOrder(
        @Param("user1") User user1, 
        @Param("user2") User user2, 
        @Param("orderId") Integer orderId
    );
}
