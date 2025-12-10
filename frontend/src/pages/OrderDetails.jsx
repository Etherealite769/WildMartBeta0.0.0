import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/OrderDetails.css';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/user/orders/${orderId}`, {
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
  };

  const handleCancelOrder = async () => {
    try {
      const response = await axios.put(
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
      <div className="order-details-page">
        <Navbar />
        <div className="order-details-container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <Navbar />
        <div className="order-details-container">
          <div className="error-message">{error || 'Order not found'}</div>
          <button className="btn-back" onClick={() => navigate('/my-orders')}>
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  // Calculate values for display
  const totalAmount = Number(order.totalAmount) || 0;
  const discountAmount = Number(order.discountAmount) || 0;
  const shippingFee = Number(order.shippingFee) || (totalAmount * 0.05); // Default to 5% if not provided
  const subtotal = totalAmount + discountAmount - shippingFee;

  return (
    <div className="order-details-page">
      <Navbar />
      
      <div className="order-details-container">
        <div className="sales-details-section">
          {/* Header */}
          <div className="sales-details-header">
            <h2>Order #{order.orderNumber || order.orderId} Details</h2>
            <button className="btn-close-details" onClick={() => navigate('/my-orders')}>
              Close
            </button>
          </div>
          
          {/* Content */}
          <div className="sales-details-content">
            {/* Left Column - Order Summary */}
            <div className="sales-summary-section">
              <div className="sales-summary-card">
                <div className="summary-header">
                  <h3>Order Information</h3>
                </div>
                
                <div className="summary-details">
                  <div className="detail-row">
                    <span className="detail-label">Order Date:</span>
                    <span className="detail-value">
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Payment Status:</span>
                    <span className={`status-badge ${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="sales-summary-card">
                <div className="summary-header">
                  <h3>Shipping Information</h3>
                </div>
                
                <div className="summary-details">
                  <div className="detail-row">
                    <span className="detail-label">Shipping Address:</span>
                    <span className="detail-value">
                      {order.shippingAddress || 'No address provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Details */}
            <div className="sales-info-section">
              {/* Price Section */}
              <div className="sales-price-section">
                <div className="price-label">Total Amount</div>
                <div className="price-value">
                  <span className="currency">₱</span>
                  <span className="amount">
                    {totalAmount.toLocaleString('en-PH', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </div>
              </div>
              
              {/* Pricing Breakdown */}
              <div className="sales-pricing-breakdown">
                <h3>Pricing Breakdown</h3>
                <div className="pricing-breakdown">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>
                      ₱{subtotal.toLocaleString('en-PH', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>
                      ₱{shippingFee.toLocaleString('en-PH', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="summary-row discount-row">
                      <span>Discount:</span>
                      <span>
                        -₱{discountAmount.toLocaleString('en-PH', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                  )}
                  <div className="summary-row total-row">
                    <strong>Total:</strong>
                    <strong>
                      ₱{totalAmount.toLocaleString('en-PH', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </strong>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div className="sales-order-items">
                <h3>Order Items ({order.items?.length || 0})</h3>
                <div className="order-items-list">
                  {order.items?.map(item => {
                    // Extract seller name with fallback logic
                    let sellerName = 'Unknown Seller';
                    const seller = item.product?.seller;
                    
                    if (item.product?.sellerName) {
                      sellerName = item.product.sellerName;
                    } else if (item.product?.fullName) {
                      sellerName = item.product.fullName;
                    } else if (item.product?.full_name) {
                      sellerName = item.product.full_name;
                    } else if (seller) {
                      if (seller.firstName && seller.lastName) {
                        sellerName = `${seller.firstName} ${seller.lastName}`;
                      } else if (seller.fullName) {
                        sellerName = seller.fullName;
                      } else if (seller.full_name) {
                        sellerName = seller.full_name;
                      } else if (seller.firstName) {
                        sellerName = seller.firstName;
                      } else if (seller.lastName) {
                        sellerName = seller.lastName;
                      } else if (seller.name) {
                        sellerName = seller.name;
                      } else if (seller.username) {
                        sellerName = seller.username;
                      } else if (seller.email) {
                        // Extract name from email (before @)
                        sellerName = seller.email.split('@')[0];
                      }
                    }
                    
                    return (
                      <div key={item.id} className="order-item">
                        <div className="item-image">
                          <img 
                            src={item.product?.imageUrl || '/placeholder.png'} 
                            alt={item.product?.productName}
                            onError={(e) => {
                              e.target.src = '/placeholder.png';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <h4>{item.product?.productName}</h4>
                          <p>Seller: {sellerName}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>
                            Price: ₱{Number(item.unitPrice).toLocaleString('en-PH', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </p>
                        </div>
                        <div className="item-price">
                          ₱{Number(item.subtotal).toLocaleString('en-PH', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons at Bottom */}
          {order.orderStatus === 'Pending' && (
            <div className="sales-actions">
              <button 
                className="btn-cancel-order"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Order
              </button>
            </div>
          )}
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
    </div>
  );
};

export default OrderDetails;