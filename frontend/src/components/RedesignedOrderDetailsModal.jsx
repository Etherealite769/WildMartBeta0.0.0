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
  const [activeTab, setActiveTab] = useState('summary');

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
            <h2>Loading Order Details...</h2>
            <button className="btn-close" onClick={onClose}>×</button>
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
            <button className="btn-close" onClick={onClose}>×</button>
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

  // Get first 3 items for preview
  const previewItems = order.items?.slice(0, 3) || [];

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
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Summary
          </button>
          <button 
            className={`tab ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Items ({order.items?.length || 0})
          </button>
          <button 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="summary-tab">
              <div className="summary-grid">
                <div className="summary-card">
                  <h3>Order Information</h3>
                  <div className="info-row">
                    <span className="label">Order Date</span>
                    <span className="value">
                      {new Date(order.orderDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status</span>
                    <span className={`value status-badge ${order.orderStatus?.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Payment Status</span>
                    <span className={`value status-badge ${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  {isSeller && order.buyer && (
                    <div className="info-row">
                      <span className="label">Buyer</span>
                      <span className="value">
                        {order.buyer?.fullName || order.buyer?.username || 'Unknown Buyer'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="summary-card">
                  <h3>Shipping Information</h3>
                  <div className="info-row">
                    <span className="label">Address</span>
                    <span className="value address-value">
                      {order.shippingAddress || 'No address provided'}
                    </span>
                  </div>
                </div>
                
                <div className="pricing-summary">
                  <h3>Order Total</h3>
                  <div className="total-amount">
                    ₱{totalAmount.toLocaleString('en-PH', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
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
                  </div>
                </div>
              </div>
              
              {/* Items Preview */}
              <div className="items-preview-section">
                <h3>Items Preview</h3>
                <div className="items-preview-grid">
                  {previewItems.map(item => {
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
                        sellerName = seller.email.split('@')[0];
                      }
                    }
                    
                    return (
                      <div key={item.id} className="preview-item">
                        <img 
                          src={item.product?.imageUrl || '/placeholder.png'} 
                          alt={item.product?.productName}
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                        <div className="preview-item-details">
                          <h4>{item.product?.productName}</h4>
                          <p className="seller">by {sellerName}</p>
                          <div className="item-meta">
                            <span className="quantity">Qty: {item.quantity}</span>
                            <span className="price">
                              ₱{Number(item.subtotal).toLocaleString('en-PH', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {order.items?.length > 3 && (
                    <div className="preview-more">
                      <span>+{order.items.length - 3} more items</span>
                      <button 
                        className="btn-view-all"
                        onClick={() => setActiveTab('items')}
                      >
                        View All
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="items-tab">
              <div className="items-list">
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
                      sellerName = seller.email.split('@')[0];
                    }
                  }
                  
                  return (
                    <div key={item.id} className="item-card">
                      <div className="item-main">
                        <img 
                          src={item.product?.imageUrl || '/placeholder.png'} 
                          alt={item.product?.productName}
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                        <div className="item-details">
                          <h4>{item.product?.productName}</h4>
                          <p className="seller">by {sellerName}</p>
                          <div className="item-meta">
                            <span className="quantity">Quantity: {item.quantity}</span>
                            <span className="unit-price">
                              Unit Price: ₱{Number(item.unitPrice).toLocaleString('en-PH', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
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
                        {!isSeller && item.product?.seller?.userId && (
                          <button 
                            className="btn-message"
                            onClick={() => {
                              setSelectedSeller({
                                id: item.product.seller.userId,
                                name: sellerName,
                                image: item.product.seller.profileImage,
                                productId: item.product.productId,
                                productName: item.product.productName
                              });
                              setShowMessageModal(true);
                            }}
                          >
                            Message Seller
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="details-tab">
              <div className="details-grid">
                <div className="details-card">
                  <h3>Payment Information</h3>
                  <div className="info-row">
                    <span className="label">Payment Method</span>
                    <span className="value">Credit Card</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Payment Status</span>
                    <span className={`value status-badge ${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Total Amount</span>
                    <span className="value total-amount">
                      ₱{totalAmount.toLocaleString('en-PH', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="details-card">
                  <h3>Shipping Details</h3>
                  <div className="info-row">
                    <span className="label">Shipping Address</span>
                    <span className="value address-value">
                      {order.shippingAddress || 'No address provided'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Shipping Fee</span>
                    <span className="value">
                      ₱{shippingFee.toLocaleString('en-PH', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Estimated Delivery</span>
                    <span className="value">3-5 business days</span>
                  </div>
                </div>
                
                <div className="details-card">
                  <h3>Pricing Breakdown</h3>
                  <div className="pricing-details">
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
                      <span>
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
            </div>
          )}
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
          productId={selectedSeller.productId}
          productName={selectedSeller.productName}
          orderId={parseInt(orderId)}
          orderNumber={order?.orderNumber || order?.orderId}
        />
      )}
    </div>
  );
};

export default RedesignedOrderDetailsModal;