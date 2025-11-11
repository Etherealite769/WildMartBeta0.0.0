import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/MyPurchases.css';

const MyPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/purchases', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const filteredPurchases = purchases.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="my-purchases-page">
      <Navbar />
      
      <div className="my-purchases-container">
        <h2>My Purchases</h2>

        <div className="filter-tabs">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        <div className="purchases-list">
          {filteredPurchases.map(purchase => (
            <div key={purchase.id} className="purchase-item">
              <div className="purchase-image">
                <img src={purchase.product?.imageUrl || '/placeholder.png'} alt={purchase.product?.name} />
              </div>
              <div className="purchase-details">
                <h3>{purchase.product?.name}</h3>
                <p className="purchase-date">Purchased on: {new Date(purchase.date).toLocaleDateString()}</p>
                <p className="purchase-price">${purchase.totalPrice}</p>
                <p className="purchase-status">{purchase.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPurchases;
