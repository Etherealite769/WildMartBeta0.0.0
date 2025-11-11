import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import '../styles/RecentlyViewed.css';

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/recently-viewed', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRecentProducts(response.data);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    }
  };

  return (
    <div className="recently-viewed-page">
      <Navbar />
      
      <div className="recently-viewed-container">
        <h2>Recently Viewed</h2>

        {recentProducts.length > 0 ? (
          <div className="products-grid">
            {recentProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No recently viewed products</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;
