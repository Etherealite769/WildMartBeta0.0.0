import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import MessageModal from '../components/MessageModal';
import '../styles/Conversations.css';

const Conversations = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
  }, []);

  useEffect(() => {
    // Check if there are any unread messages
    const unreadExists = conversations.some(conversation => !conversation.isRead);
    setHasUnreadMessages(unreadExists);
  }, [conversations]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      console.log('Fetching conversations with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get('http://localhost:8080/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Conversations fetched:', response.data);
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.error('Error response:', error.response?.data);
      
      // Show user-friendly error message
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
      } else if (error.response?.status === 403) {
        alert('Access denied. Please check your permissions.');
      } else {
        alert('Failed to load conversations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  const openConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      await axios.post('http://localhost:8080/api/messages/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the conversations state to mark all as read
      setConversations(prevConversations => 
        prevConversations.map(conversation => ({
          ...conversation,
          isRead: true
        }))
      );
      
      setHasUnreadMessages(false);
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to mark all messages as read. Please try again.');
    }
  };

  return (
    <div className="conversations-page">
      <Navbar />
      
      <div className="conversations-container">
        <div className="conversations-header">
          <h2>Messages</h2>
          {hasUnreadMessages && (
            <button className="mark-all-read-btn" onClick={markAllAsRead}>
              Mark All Read
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="conversations-loading">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p>No conversations yet</p>
            <span>Start messaging sellers or buyers!</span>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map(conversation => (
              <div 
                key={conversation.conversationId} 
                className={`conversation-card ${selectedConversation?.conversationId === conversation.conversationId ? 'active' : ''}`}
                onClick={() => openConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {conversation.otherUser?.profileImage ? (
                    <img src={conversation.otherUser.profileImage} alt={conversation.otherUser.fullName} />
                  ) : (
                    <span>{(conversation.otherUser?.fullName || conversation.otherUser?.username || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <h3>{conversation.otherUser?.fullName || conversation.otherUser?.username || 'Unknown User'}</h3>
                    <span className="conversation-time">{formatTime(conversation.lastMessageTime)}</span>
                  </div>
                  <div className="conversation-preview">
                    <p>{conversation.lastMessage || 'No messages yet'}</p>
                    {!conversation.isRead && (
                      <span className="unread-indicator"></span>
                    )}
                  </div>
                  {(conversation.product || conversation.order) && (
                    <div className="conversation-context">
                      {conversation.product && (
                        <span className="context-tag product-tag">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                          </svg>
                          {conversation.product.productName}
                        </span>
                      )}
                      {conversation.order && (
                        <span className="context-tag order-tag">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                          </svg>
                          Order #{conversation.order.orderNumber}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedConversation && (
          <MessageModal
            isOpen={true}
            onClose={() => setSelectedConversation(null)}
            receiverId={selectedConversation.otherUser?.userId}
            receiverName={selectedConversation.otherUser?.fullName || selectedConversation.otherUser?.username}
            receiverImage={selectedConversation.otherUser?.profileImage}
            productId={selectedConversation.product?.productId}
            productName={selectedConversation.product?.productName}
            orderId={selectedConversation.order?.orderId}
            orderNumber={selectedConversation.order?.orderNumber}
          />
        )}
      </div>
    </div>
  );
};

export default Conversations;