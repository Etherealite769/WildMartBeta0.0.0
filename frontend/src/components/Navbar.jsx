import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/logo_wildmart.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSeller = user?.role === 'SELLER';

  useEffect(() => {
    fetchUserProfile();
  }, [location]); // Add location as dependency to fetch on route change

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Add cache-busting parameter
        const timestamp = Date.now();
        const response = await axios.get(`http://localhost:8080/api/user/profile?t=${timestamp}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        } else {
          setProfileImage(null); // Reset to null if no profile image
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Reset profile image on error
      setProfileImage(null);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfileImage(null); // Clear profile image on logout
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <img src={logo} alt="WildMart Logo" className="navbar-logo" />
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
          {isSeller && <Link to="/my-products" className={`nav-link ${isActive('/my-products') ? 'active' : ''}`}>My Products</Link>}
          {isSeller && <Link to="/my-sales" className={`nav-link ${isActive('/my-sales') ? 'active' : ''}`}>My Sales</Link>}
          <Link to="/my-orders" className={`nav-link ${isActive('/my-orders') ? 'active' : ''}`}>My Orders</Link>
          <Link to="/my-likes" className={`nav-link ${isActive('/my-likes') ? 'active' : ''}`}>Likes</Link>
          <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}>
            🛒 Cart
          </Link>
        </div>

        <div className="navbar-actions">
          <div className="user-menu">
            <button className="user-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className="user-info">
                <span className="user-fullname">{user?.fullName || user?.username || 'User'}</span>
                <div className="user-avatar">
                  {profileImage ? (
                    <img 
                      src={`${profileImage}?t=${Date.now()}`} 
                      alt="Profile" 
                      className="avatar-img"
                      onError={(e) => {
                        // Handle image load error by resetting profile image
                        setProfileImage(null);
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {(user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <Link to="/account" className="dropdown-item">Account Settings</Link>
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