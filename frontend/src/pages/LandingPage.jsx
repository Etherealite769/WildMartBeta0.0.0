import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-content">
          <div className="logo-section">
            <h1 className="brand-name">WildMart</h1>
            <p className="university-subtitle">Your Exclusive University Marketplace</p>
          </div>
          
          <div className="description-section">
            <p className="description-text">
              Discover a wide range of products from fellow students. 
              Buy and sell textbooks, electronics, and more right here on campus.
            </p>
          </div>

          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              Shop Now
            </button>
          </div>
        </div>

        <div className="landing-visual">
          <div className="visual-circle"></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
