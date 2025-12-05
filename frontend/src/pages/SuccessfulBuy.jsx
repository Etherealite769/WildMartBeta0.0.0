import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/SuccessfulBuy.css';

const SuccessfulBuy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData || {};

  return (
    <div className="success-page">
      <Navbar />
      
      <div className="success-container">
        <div className="success-icon">
          <div className="checkmark">✓</div>
        </div>
        
        <h2>Order Placed Successfully!</h2>
        <p className="success-message">
          Thank you for your purchase! Your order has been confirmed.
        </p>

        <div className="order-details">
          {orderData.orderNumber && (
            <div className="detail-row">
              <span>Order Number:</span>
              <strong>{orderData.orderNumber}</strong>
            </div>
          )}
          {orderData.totalAmount && (
            <div className="detail-row">
              <span>Total Amount:</span>
              <strong>₱{Number(orderData.totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
          )}
          {orderData.paymentMethod && (
            <div className="detail-row">
              <span>Payment Method:</span>
              <span>{orderData.paymentMethod}</span>
            </div>
          )}
          {orderData.shippingAddress && (
            <div className="detail-row">
              <span>Delivery Address:</span>
              <span>{orderData.shippingAddress}</span>
            </div>
          )}
          <div className="detail-row">
            <span>Order Status:</span>
            <span className="status-badge">{orderData.orderStatus || 'Pending'}</span>
          </div>
          <div className="detail-row">
            <span>Estimated Delivery:</span>
            <span>3-5 Business Days</span>
          </div>
        </div>

        <div className="success-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/my-orders')}
          >
            View My Orders
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessfulBuy;
