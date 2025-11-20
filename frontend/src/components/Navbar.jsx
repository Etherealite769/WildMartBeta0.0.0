import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          WildMart
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/my-products" className="nav-link">My Products</Link>
          <Link to="/my-orders" className="nav-link">My Orders</Link>
          <Link to="/my-likes" className="nav-link">Likes</Link>
          <Link to="/cart" className="nav-link">
            🛒 Cart
          </Link>
        </div>

        <div className="navbar-actions">
          <div className="user-menu">
            <button className="user-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <Link to="/account" className="dropdown-item">Account Settings</Link>
                <Link to="/recently-viewed" className="dropdown-item">Recently Viewed</Link>
                <button onClick={handleLogout} className="dropdown-item logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
