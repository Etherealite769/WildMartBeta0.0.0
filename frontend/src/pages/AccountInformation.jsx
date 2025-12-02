import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/AccountInformation.css';
import profilePlaceholder from '../assets/placeholder.png';

const AccountInformation = () => {
  const [profileName, setProfileName] = useState(''); 
  const [activeTab, setActiveTab] = useState('accountInformation');

  const navigate = useNavigate();
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
    phone: '', // Maps to phoneNumber on backend
    address: '', // Maps to shippingAddress on backend
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
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
      // Map backend fields to frontend state
      setAccountData({
        ...response.data,
        phone: response.data.phoneNumber || '',
        address: response.data.shippingAddress || ''
      });
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

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Prepare data for account update
      const updatePayload = {
        username: accountData.username,
        email: accountData.email,
        phoneNumber: accountData.phone, // Map frontend 'phone' to backend 'phoneNumber'
        shippingAddress: accountData.address, // Map frontend 'address' to backend 'shippingAddress'
      };

      await axios.put('http://localhost:8080/api/user/account', updatePayload, config);
      alert('Account information updated successfully!');

      // Handle password change if newPassword fields are filled
      if (newPassword || confirmNewPassword) {
        if (newPassword !== confirmNewPassword) {
          alert('New password and confirm password do not match.');
          return;
        }
        if (newPassword.length < 6) { // Example: minimum password length
          alert('Password must be at least 6 characters long.');
          return;
        }
        
        // Assuming a separate endpoint for password change
        await axios.post('http://localhost:8080/api/user/change-password', { newPassword }, config);
        alert('Password updated successfully!');
        setNewPassword('');
        setConfirmNewPassword('');
      }

    } catch (error) {
      console.error('Error updating account or password:', error);
      alert('Failed to update account information or password.');
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
          <div className="account-form-content display-info">
            <h3>Account Information</h3>
            <div className="info-group">
              <label>Username:</label>
              <span>{accountData.username}</span>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <span>{accountData.email}</span>
            </div>
            <div className="info-group">
              <label>Phone:</label>
              <span>{accountData.phone || 'N/A'}</span>
            </div>
            <div className="info-group">
              <label>Address:</label>
              <span>{accountData.address || 'N/A'}</span>
            </div>
          </div>
        );
      case 'editProfile':
        return (
          <div className="account-form-content">
            <h3 style={{ color: '#800000' }}>Edit Profile Information</h3>
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
              </div>

              <div className="form-section">
                <h3>Account Security</h3>
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <input
                    type="password"
                    id="new-password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-new-password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm-new-password"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={handleConfirmPasswordChange}
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
                  onClick={() => setActiveTab('accountInformation')}
                >
                  Cancel
                </button>
              </div>
            </form>
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
            <h1 className="profile-name">{accountData.fullName || accountData.username}</h1>
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
