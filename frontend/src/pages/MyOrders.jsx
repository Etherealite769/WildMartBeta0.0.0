import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import '../styles/MyOrders.css';

const MyOrders = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Add this to access navigation state
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for order success message from checkout
    const locationState = location.state;
    if (locationState?.orderSuccess) {
      toast.success('Order placed successfully!');
      // Clear the location state so the message doesn't appear again on refresh
      window.history.replaceState({}, document.title);
    }
    
    fetchOrders();
  }, [location.state]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const response = await axios.get('http://localhost:8080/api/user/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Orders API Response:', response.data);
      
      // Ensure we always set an array
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Authentication failed. Please log in again.');
          // Optionally redirect to login page
          // navigate('/login');
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Failed to load orders: ${error.response.data?.error || error.message}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setError('Network error. Please check your connection.');
      } else {
        // Something else happened
        setError(`Error: ${error.message}`);
      }
      
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Add a refresh function to manually refresh orders
  const refreshOrders = async () => {
    setLoading(true);
    setError(null);
    await fetchOrders();
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    if (filter === 'all') return true;
    return order.orderStatus?.toLowerCase() === filter.toLowerCase();
  }) : [];

  if (loading) {
    return (
      <div className="my-orders-page">
        <Navbar />
        <div className="my-orders-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-page">
        <Navbar />
        <div className="my-orders-container">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={refreshOrders} className="btn-refresh">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <Navbar />
      
      <div className="my-orders-container">
        <div className="sticky-header">
          <h2>My Orders</h2>

          <div className="header-actions">
            <div className="filter-tabs">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Orders
              </button>
              <button 
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
                onClick={() => setFilter('shipped')}
              >
                Shipped
              </button>
              <button 
                className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                onClick={() => setFilter('delivered')}
              >
                Delivered
              </button>
            </div>
            <button 
              onClick={refreshOrders} 
              className="btn-refresh-header"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 16h5v5"></path>
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="orders-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div 
                onClick={() => navigate(`/order-details/${order.orderId}`)}
              >
                <div className="order-main">
                  <div className="order-number-col">
                    <span className="order-number">{order.orderNumber || `#${order.orderId}`}</span>
                  </div>
                  <div className="order-date-col">
                    <span className="label">Date:</span>
                    <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className="order-items-count-col">
                    <span className="label">Items:</span>
                    <span>{order.items?.length || 0}</span>
                  </div>
                  <div className="order-total-col">
                    <span className="label">Total:</span>
                    <span className="amount">₱{Number(order.totalAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="order-status-col">
                    <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
                  <path d="M3 8l9-5 9 5"></path>
                  <line x1="12" y1="3" x2="12" y2="8"></line>
                </svg>
              </div>
              <p>No orders yet</p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">Start Shopping</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;