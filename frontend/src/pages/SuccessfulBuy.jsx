import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/SuccessfulBuy.css';

const SuccessfulBuy = () => {
  const navigate = useNavigate();

  return (
    <div className="success-page">
      <Navbar />
      
      <div className="success-container">
        <div className="success-icon">
          <div className="checkmark">✓</div>
        </div>
        
        <h2>Successful!</h2>
        <p className="success-message">
          Your order has been placed successfully!
        </p>

        <div className="order-details">
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>Credit Card</span>
          </div>
          <div className="detail-row">
            <span>Delivery Address:</span>
            <span>123 Main Street, City</span>
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
