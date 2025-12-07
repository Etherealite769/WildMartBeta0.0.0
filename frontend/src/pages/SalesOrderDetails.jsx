import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/OrderDetails.css';

const SalesOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <button className="btn-back" onClick={() => navigate('/my-sales')}>
            Back to My Sales
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
        <div className="order-details-header">
          <button className="btn-back" onClick={() => navigate('/my-sales')}>
            ← Back to My Sales
          </button>
        </div>

        <div className="order-details-card-compact">
          {/* Compact Order Summary */}
          <div className="order-summary-compact">
            <div className="summary-left">
              <div className="summary-item">
                <label>Order Number</label>
                <p className="order-number">{order.orderNumber || `#${order.orderId}`}</p>
              </div>
              <div className="summary-item">
                <label>Date</label>
                <p>{new Date(order.orderDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</p>
              </div>
            </div>
            
            <div className="summary-center">
              <div className="summary-item">
                <label>Status</label>
                <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="summary-item">
                <label>Payment</label>
                <span className={`payment-badge ${order.paymentStatus?.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
            
            <div className="summary-right">
              <div className="summary-item">
                <label>Total Amount</label>
                <p className="total-amount">₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Detailed Pricing Breakdown */}
          <div className="pricing-breakdown">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-row">
              <span>Shipping (5%):</span>
              <span>₱{shippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount:</span>
                <span>-₱{discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="summary-row total-row">
              <strong>Total:</strong>
              <strong>₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="shipping-address-compact">
            <label>Buyer:</label>
            <p>{order.buyer?.fullName || order.buyer?.username || 'Unknown Buyer'}</p>
          </div>

          {/* Shipping Address */}
          <div className="shipping-address-compact">
            <label>Shipping Address:</label>
            <p>{order.shippingAddress || 'No address provided'}</p>
          </div>

          {/* Compact Items Table */}
          <div className="order-items-table">
            <div className="table-header">
              <div className="col-image">IMAGE</div>
              <div className="col-product">PRODUCT</div>
              <div className="col-seller">SELLER</div>
              <div className="col-qty">QTY</div>
              <div className="col-subtotal">AMOUNT</div>
            </div>
            <div className="table-body">
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
                  <div key={item.id} className="table-row">
                    <div className="col-image">
                      <img 
                        src={item.product?.imageUrl || '/placeholder.png'} 
                        alt={item.product?.productName}
                      />
                    </div>
                    <div className="col-product">{item.product?.productName}</div>
                    <div className="col-seller">{sellerName}</div>
                    <div className="col-qty">{item.quantity}</div>
                    <div className="col-subtotal">₱{Number(item.subtotal).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrderDetails;