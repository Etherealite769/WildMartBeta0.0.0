import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/AccountInformation.css';
import profilePlaceholder from '../assets/placeholder.png';

const AccountInformation = () => {
  const [profileName, setProfileName] = useState('NAME');
  const [profileDescription, setProfileDescription] = useState('About the User!'); 
  const [activeTab, setActiveTab] = useState('accountInformation');

  const navigate = useNavigate();
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: ''
  });
  const [userRole, setUserRole] = useState('BUYER');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/account', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAccountData(response.data);
      // Get user role from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUserRole(storedUser.role || 'BUYER');
    } catch (error) {
      console.error('Error fetching account info:', error);
    }
  };

  const handleChange = (e) => {
    setAccountData({
      ...accountData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:8080/api/user/account', accountData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Account information updated successfully!');
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleBecomeSellerClick = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      console.log('Making request to become seller...');
      
      // Call dedicated become-seller endpoint
      const response = await axios.post('http://localhost:8080/api/user/become-seller', {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Seller response:', response.data);

      // Update localStorage with new role
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.role = 'SELLER';
      localStorage.setItem('user', JSON.stringify(storedUser));

      setUserRole('SELLER');
      alert('Congratulations! You are now a seller. You can now add and manage your products!');
      window.location.reload(); // Refresh to update navbar
    } catch (error) {
      const errorMessage = error.response?.data || error.message || 'Unknown error occurred';
      console.error('Error becoming a seller:', errorMessage);
      alert('Failed to become a seller: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'accountInformation':
        return (
          <div className="account-form-content">
            <div className="input-group">
              <label htmlFor="change-password">Change Password</label>
              <input type="password" id="change-password" placeholder="Change Password" />
            </div>
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input type="password" id="confirm-password" placeholder="Confirm Password" />
            </div>
            <div className="input-group">
              <label htmlFor="change-email">Change Email</label>
              <input type="email" id="change-email" placeholder="Change Email" />
            </div>
            <div className="input-group">
              <label htmlFor="verify">Verify</label>
              <input type="text" id="verify" placeholder="Verify" />
            </div>
            <button className="save-button">SAVE</button>
          </div>
        );
      case 'editProfile':
        return (
          <div className="account-form-content">
            <h3>Edit Profile Content</h3>
            <form onSubmit={handleSubmit} className="account-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={accountData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={accountData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={accountData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-group">
                  <label htmlFor="address">Street Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={accountData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={accountData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode">Zip Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={accountData.zipCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={accountData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/profile')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );
      case 'about':
        return (
          <div className="account-form-content">
            <h3>About Content</h3>
            <p>This is the about section of the profile page.</p>
          </div>
        );
      case 'becomeSeller':
        return (
          <div className="account-form-content">
            <div className="seller-section">
              {userRole === 'SELLER' ? (
                <div className="seller-status">
                  <h3>✓ You are already a seller</h3>
                  <p>You can now manage your products and view the "My Products" section in the navigation bar.</p>
                </div>
              ) : (
                <div className="seller-prompt">
                  <h3>Become a Seller</h3>
                  <p>Start selling your products on WildMart! Once you become a seller, you'll be able to:</p>
                  <ul>
                    <li>Add and manage your products</li>
                    <li>View your sales and orders</li>
                    <li>Access the "My Products" section in the navigation</li>
                    <li>Reach thousands of buyers</li>
                  </ul>
                  <button 
                    className="become-seller-btn"
                    onClick={handleBecomeSellerClick}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Become a Seller Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="account-information-page">
      <Navbar />
      
      <div className="profile-header">
        <div className="profile-banner">
          <div className="profile-picture-container">
            <img src={profilePlaceholder} alt="Profile" className="profile-picture" />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{profileName}</h1>
            <p className="profile-description">{profileDescription}</p>
          </div>
        </div>
      </div>

      <div className="profile-content-container">
        <div className="sidebar">
          <button 
            className={`sidebar-button ${activeTab === 'accountInformation' ? 'active' : ''}`}
            onClick={() => setActiveTab('accountInformation')}
          >
            ACCOUNT INFORMATION
          </button>
          <button 
            className={`sidebar-button ${activeTab === 'editProfile' ? 'active' : ''}`}
            onClick={() => setActiveTab('editProfile')}
          >
            EDIT PROFILE
          </button>
          <button 
            className={`sidebar-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            ABOUT
          </button>
          {userRole !== 'SELLER' && (
            <button 
              className={`sidebar-button seller-btn ${activeTab === 'becomeSeller' ? 'active' : ''}`}
              onClick={() => setActiveTab('becomeSeller')}
            >
              🚀 BECOME A SELLER
            </button>
          )}
          <button className="sidebar-button logout-button">LOGOUT</button>
        </div>
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AccountInformation;
