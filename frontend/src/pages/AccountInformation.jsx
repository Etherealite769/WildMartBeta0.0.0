import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/AccountInformation.css';

const AccountInformation = () => {
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

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/account', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAccountData(response.data);
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

  return (
    <div className="account-info-page">
      <Navbar />
      
      <div className="account-info-container">
        <h2>Account Information</h2>

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
    </div>
  );
};

export default AccountInformation;
