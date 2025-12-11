import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/MessageModal.css';

const MessageModal = ({ 
  isOpen, 
  onClose, 
  receiverId, 
  receiverName, 
  receiverImage,
  productId = null,
  productName = null,
  orderId = null,
  orderNumber = null
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && receiverId) {
      fetchOrCreateConversation();
    }
  }, [isOpen, receiverId, productId, orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOrCreateConversation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get conversation ID
      let convId = null;
      if (productId) {
        const response = await axios.get(
          `http://localhost:8080/api/messages/product-conversation/${productId}/seller/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        convId = response.data.conversationId;
      } else {
        // For direct messages or order messages, construct the ID
        const userResponse = await axios.get('http://localhost:8080/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userId = userResponse.data.userId;
        const user1 = Math.min(userId, receiverId);
        const user2 = Math.max(userId, receiverId);
        convId = `conv_${user1}_${user2}`;
        if (orderId) {
          convId += `_o${orderId}`;
        }
      }
      
      setConversationId(convId);
      
      // Fetch existing messages
      const messagesResponse = await axios.get(
        `http://localhost:8080/api/messages/conversation/${convId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setMessages(messagesResponse.data || []);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        receiverId: parseInt(receiverId),
        content: newMessage.trim()
      };
      
      if (productId) {
        payload.productId = parseInt(productId);
      }
      if (orderId) {
        payload.orderId = parseInt(orderId);
      }
      
      console.log('Sending message payload:', payload);

      const response = await axios.post(
        'http://localhost:8080/api/messages/send',
        payload,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // Add the new message to the list
      const newMsg = {
        messageId: response.data.messageId,
        content: response.data.content,
        createdAt: response.data.createdAt,
        isSender: true,
        sender: { fullName: 'You' }
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
      if (response.data.conversationId) {
        setConversationId(response.data.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to send message: ' + (error.response?.data?.error || error.message));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="message-modal-overlay" onClick={onClose}>
      <div className="message-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="message-modal-header">
          <div className="message-recipient-info">
            <div className="recipient-avatar">
              {receiverImage ? (
                <img src={receiverImage} alt={receiverName} />
              ) : (
                <span>{receiverName?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="recipient-details">
              <h3>{receiverName}</h3>
              {productName && (
                <span className="context-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  {productName}
                </span>
              )}
              {orderNumber && (
                <span className="context-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  Order #{orderNumber}
                </span>
              )}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="message-modal-body">
          {loading ? (
            <div className="messages-loading">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="no-messages">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>No messages yet</p>
              <span>Start the conversation!</span>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message, index) => {
                const showDate = index === 0 || 
                  formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
                
                return (
                  <React.Fragment key={message.messageId}>
                    {showDate && (
                      <div className="message-date-divider">
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                    )}
                    <div className={`message-bubble ${message.isSender ? 'sent' : 'received'}`}>
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">{formatTime(message.createdAt)}</div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="message-modal-footer">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows="1"
          />
          <button 
            className="send-btn"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <div className="send-spinner"></div>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
