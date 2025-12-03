import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import '../styles/MyLikes.css';

const MyLikes = () => {
  const navigate = useNavigate();
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedProducts();
  }, []);

  const fetchLikedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/user/likes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Liked products:', response.data);
      // Handle both array and set responses
      const products = Array.isArray(response.data) ? response.data : Array.from(response.data);
      setLikedProducts(products);
    } catch (error) {
      console.error('Error fetching liked products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (productId) => {
    try {
      await axios.delete(`http://localhost:8080/api/user/likes/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchLikedProducts();
    } catch (error) {
      console.error('Error unliking product:', error);
    }
  };

  if (loading) {
    return (
      <div className="my-likes-page">
        <Navbar />
        <div className="my-likes-container">
          <h2>My Likes</h2>
          <div className="loading-likes">Loading your liked products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-likes-page">
      <Navbar />
      
      <div className="my-likes-container">
        <h2>My Likes</h2>
        <p className="likes-count">{likedProducts.length} product{likedProducts.length !== 1 ? 's' : ''} liked</p>

        <div className="liked-products-grid">
          {likedProducts.length > 0 ? (
            likedProducts.map(product => {
              const productId = product.productId || product.id;
              return (
                <div key={productId} className="liked-product-card">
                  <ProductCard 
                    product={product}
                    onClick={() => navigate(`/product/${productId}`)}
                  />
                  <button 
                    className="btn-unlike"
                    onClick={() => handleUnlike(productId)}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    Remove from Likes
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <p>No liked products yet</p>
              <span>Start exploring and like products you love!</span>
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
    </div>
  );
};

export default MyLikes;
