import React from 'react';
import logo from '../assets/logo_wildmart.png';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBook, FaLaptop } from 'react-icons/fa';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <img src={logo} alt="WildMart Logo" className="brand-name" style={{ height: '50px' }} />
        <nav>
          <button className="btn-secondary" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
        </nav>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">Your Campus Marketplace</h2>
            <p className="hero-subtitle">Buy, sell, and discover amazing deals right here at your university.</p>
            <button className="btn-primary-large" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
          <div className="hero-visual">
            {/* You can add an illustration or image here */}
          </div>
        </section>

        <section className="features-section">
          <h3 className="section-title">What You Can Find</h3>
          <div className="features-grid">
            <div className="feature-item">
              <FaBook className="feature-icon" />
              <h4>Textbooks</h4>
              <p>Find required textbooks at a lower price.</p>
            </div>
            <div className="feature-item">
              <FaLaptop className="feature-icon" />
              <h4>Electronics</h4>
              <p>Get great deals on laptops, phones, and more.</p>
            </div>
            <div className="feature-item">
              <FaShoppingCart className="feature-icon" />
              <h4>And More!</h4>
              <p>From dorm essentials to event tickets.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; 2025 WildMart. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
