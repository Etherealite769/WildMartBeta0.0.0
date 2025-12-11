import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';
import MessageModal from './MessageModal';
import '../styles/RedesignedOrderDetails.css';

const RedesignedOrderDetailsModal = ({ orderId, onClose, isSeller = false }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isSeller 
        ? `http://localhost:8080/api/user/sales/${orderId}`
        : `http://localhost:8080/api/user/orders/${orderId}`;
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId, isSeller]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelOrder = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/user/orders/${orderId}/status`,
        { orderStatus: 'Cancelled' },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      // Update the order status in state
      setOrder(prevOrder => ({
        ...prevOrder,
        orderStatus: 'Cancelled'
      }));
      
      toast.success('Order cancelled successfully!');
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order: ' + (error.response?.data?.error || error.message));
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="redesigned-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Order Details</h2>
            {/* Removed close button as per user preference */}
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading order information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="redesigned-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Order Details</h2>
            {/* Removed close button as per user preference */}
          </div>
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error || 'Order not found'}</p>
            <button className="btn-primary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate values for display
  const totalAmount = Number(order.totalAmount) || 0;
  const discountAmount = Number(order.discountAmount) || 0;
  const shippingFee = Number(order.shippingFee) || (totalAmount * 0.05); // Default to 5% if not provided
  const subtotal = totalAmount + discountAmount - shippingFee;

  // Extract buyer name with fallback logic
  const getBuyerName = (buyer) => {
    if (!buyer) return 'Unknown Buyer';
    return buyer.fullName || buyer.full_name || buyer.name || buyer.username || 'Unknown Buyer';
  };

  // Extract seller name with fallback logic
  const getSellerName = (seller) => {
    if (!seller) return 'Unknown Seller';
    
    if (seller.firstName && seller.lastName) {
      return `${seller.firstName} ${seller.lastName}`;
    }
    return seller.fullName || seller.full_name || seller.name || seller.username || 'Unknown Seller';
  };

  // Get seller info from first item (assuming single seller per order)
  const firstItem = order.items?.[0];
  const seller = firstItem?.product?.seller;
  const sellerName = seller ? getSellerName(seller) : 'Unknown Seller';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="redesigned-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Order #{order.orderNumber || order.orderId}</h2>
            <div className="order-meta">
              <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                {order.orderStatus}
              </span>
              <span className="order-date">
                {new Date(order.orderDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
          {/* Removed close button as per user preference */}
        </div>
        
        {/* Main Content */}
        <div className="modal-content">
          {/* Order Summary Section */}
          <div className="section">
            <h3>Order Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Order Date</span>
                <span className="value">
                  {new Date(order.orderDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Payment Status</span>
                <span className={`value status-badge ${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {isSeller && order.buyer && (
                <div className="summary-item">
                  <span className="label">Buyer</span>
                  <span className="value">
                    {getBuyerName(order.buyer)}
                  </span>
                </div>
              )}
              <div className="summary-item">
                <span className="label">Shipping Address</span>
                <span className="value address-value">
                  {order.shippingAddress || 'No address provided'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Items Section */}
          <div className="section">
            <div className="section-header">
              <h3>Items ({order.items?.length || 0})</h3>
              {/* Single message button for the entire order (not per item) */}
              {!isSeller && seller?.userId && (
                <button 
                  className="btn-message"
                  onClick={() => {
                    setSelectedSeller({
                      id: seller.userId,
                      name: sellerName,
                      image: seller.profileImage,
                      orderId: parseInt(orderId),
                      orderNumber: order.orderNumber || order.orderId
                    });
                    setShowMessageModal(true);
                  }}
                >
                  Message Seller
                </button>
              )}
            </div>
            <div className="items-list">
              {order.items?.map(item => {
                return (
                  <div key={item.id} className="item-row">
                    <div className="item-info">
                      <img 
                        src={item.product?.imageUrl || '/placeholder.png'} 
                        alt={item.product?.productName}
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                      <div className="item-details">
                        <h4>{item.product?.productName}</h4>
                        <div className="item-meta">
                          <span className="quantity">Qty: {item.quantity}</span>
                          <span className="unit-price">
                            ₱{Number(item.unitPrice).toLocaleString('en-PH', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })} each
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="item-total">
                      <span className="price">
                        ₱{Number(item.subtotal).toLocaleString('en-PH', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Pricing Breakdown Section */}
          <div className="section pricing-section">
            <h3>Order Total</h3>
            <div className="pricing-breakdown">
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span>
                  ₱{subtotal.toLocaleString('en-PH', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
              <div className="breakdown-row">
                <span>Shipping</span>
                <span>
                  ₱{shippingFee.toLocaleString('en-PH', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="breakdown-row discount">
                  <span>Discount</span>
                  <span>
                    -₱{discountAmount.toLocaleString('en-PH', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </div>
              )}
              <div className="breakdown-row total">
                <span><strong>Total</strong></span>
                <span className="total-amount">
                  <strong>
                    ₱{totalAmount.toLocaleString('en-PH', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - only for buyers */}
        {!isSeller && order.orderStatus === 'Pending' && (
          <div className="modal-footer">
            <button 
              className="btn-cancel"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Order
            </button>
          </div>
        )}
        
        {/* Navigation Footer */}
        <div className="navigation-footer">
          <button className="btn-secondary" onClick={onClose}>
            Back to Orders
          </button>
        </div>
      </div>
      
      {/* Cancel Order Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep Order"
      />
      
      {/* Message Seller Modal */}
      {selectedSeller && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedSeller(null);
          }}
          receiverId={selectedSeller.id}
          receiverName={selectedSeller.name}
          receiverImage={selectedSeller.image}
          orderId={selectedSeller.orderId}
          orderNumber={selectedSeller.orderNumber}
        />
      )}
    </div>
  );
};

export default RedesignedOrderDetailsModal;