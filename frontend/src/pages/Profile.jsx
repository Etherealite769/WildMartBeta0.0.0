import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    sales: 0,
    rating: 0
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUser(response.data);
      setStats({
        products: response.data.productCount || 0,
        sales: response.data.salesCount || 0,
        rating: response.data.rating || 0
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="profile-info">
            <h2>{user?.username}</h2>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-bio">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h3>{stats.products}</h3>
            <p>Products Listed</p>
          </div>
          <div className="stat-card">
            <h3>{stats.sales}</h3>
            <p>Total Sales</p>
          </div>
          <div className="stat-card">
            <h3>{stats.rating.toFixed(1)}</h3>
            <p>Rating</p>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/edit-profile')}
          >
            Edit Profile
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/my-products')}
          >
            My Products
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/my-orders')}
          >
            My Orders
          </button>
        </div>

        <div className="profile-description">
          <h3>About Me</h3>
          <div className="description-content">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
              quis nostrud exercitation ullamco laboris.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
