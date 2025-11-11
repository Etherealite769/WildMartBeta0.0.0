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
            <h1 className="brand-name">Welcome to "WildMart"</h1>
          </div>
          
          <div className="description-section">
            <p className="description-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          <div className="action-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              Get Started
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
