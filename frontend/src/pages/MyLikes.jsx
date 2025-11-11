import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import '../styles/MyLikes.css';

const MyLikes = () => {
  const navigate = useNavigate();
  const [likedProducts, setLikedProducts] = useState([]);

  useEffect(() => {
    fetchLikedProducts();
  }, []);

  const fetchLikedProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user/likes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLikedProducts(response.data);
    } catch (error) {
      console.error('Error fetching liked products:', error);
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

  return (
    <div className="my-likes-page">
      <Navbar />
      
      <div className="my-likes-container">
        <h2>My Likes</h2>

        <div className="liked-products-grid">
          {likedProducts.length > 0 ? (
            likedProducts.map(product => (
              <div key={product.id} className="liked-product-card">
                <ProductCard 
                  product={product}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                <button 
                  className="btn-unlike"
                  onClick={() => handleUnlike(product.id)}
                >
                  ❤️ Unlike
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No liked products yet</p>
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
