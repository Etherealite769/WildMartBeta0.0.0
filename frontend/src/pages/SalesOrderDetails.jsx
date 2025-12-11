import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import DeliveryConfirmationModal from '../components/DeliveryConfirmationModal';
import MessageModal from '../components/MessageModal';
import '../styles/OrderDetails.css';

const SalesOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/user/sales/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      setError('Failed to load sale details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDelivered = () => {
    setShowDeliveryModal(true);
  };

  const handleDeliveryConfirm = async (imageFile) => {
    try {
      setUpdatingStatus(true);
      setShowDeliveryModal(false);
      
      // For now, we'll send the image as base64 string
      // In a production app, you would typically upload the image separately
      let imageData = null;
      if (imageFile) {
        imageData = await convertToBase64(imageFile);
      }
      
      const response = await axios.put(
        `http://localhost:8080/api/user/sales/${orderId}/mark-delivered`,
        null, // No body needed
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          params: {
            deliveryConfirmationImage: imageData
          }
        }
      );
      
      // Update the order in state with the new status
      setOrder(prevOrder => ({
        ...prevOrder,
        orderStatus: 'Delivered',
        deliveryConfirmationImage: imageData
      }));
      
      alert('Order marked as delivered successfully!');
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      alert('Failed to mark order as delivered: ' + (error.response?.data?.error || error.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
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
  // Calculate values for display
  const totalAmount = Number(order.totalAmount) || 0;
  const discountAmount = Number(order.discountAmount) || 0;
  const shippingFee = Number(order.shippingFee) || (totalAmount * 0.05); // Default to 5% if not provided
  const subtotal = totalAmount + discountAmount - shippingFee;

  return (
    <div className="order-details-page">
      <Navbar />
        <div className="sales-details-section">
          {/* Header */}
          <div className="sales-details-header">
            <h2>Order #{order.orderNumber || order.orderId} Details</h2>
            <button className="btn-close-details" onClick={() => navigate('/my-products')}>
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
                    <span className={`status-badge ${order.orderStatus?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Payment Status:</span>
                    <span className={`status-badge ${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Buyer:</span>
                    <span className="detail-value">
                      {order.buyer?.fullName || order.buyer?.username || 'Unknown Buyer'}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <button 
                      className="btn-message-buyer"
                      onClick={() => setShowMessageModal(true)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Message Buyer
                    </button>
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
              {/* Action Button for Mark as Delivered */}
              {order.orderStatus !== 'Delivered' && (
                <div className="sales-actions" style={{ 
                  marginBottom: '15px', 
                  textAlign: 'right' 
                }}>
                  <button 
                    className="btn-primary"
                    onClick={handleMarkAsDelivered}
                    disabled={updatingStatus}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#800000',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: updatingStatus ? 'not-allowed' : 'pointer',
                      opacity: updatingStatus ? 0.7 : 1
                    }}
                  >
                    {updatingStatus ? 'Updating...' : 'Mark as Delivered'}
                  </button>
                </div>
              )}
              
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
        </div>
        
        {/* Delivery Confirmation Modal */}
        <DeliveryConfirmationModal
          isOpen={showDeliveryModal}
          onConfirm={handleDeliveryConfirm}
          onCancel={() => setShowDeliveryModal(false)}
        />
        
        {/* Message Modal for Seller to Buyer */}
        {order && order.buyer && (
          <MessageModal
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            receiverId={order.buyer.userId}
            receiverName={order.buyer.fullName || order.buyer.username}
            receiverImage={order.buyer.profileImage}
            orderId={order.orderId}
            orderNumber={order.orderNumber}
            orderDetails={order}
            isSeller={true}
          />
        )}
      </div>
  );
};

export default SalesOrderDetails;