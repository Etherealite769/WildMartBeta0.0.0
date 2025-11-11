import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import '../styles/SellerPage.css';

const SellerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    fetchSellerData();
    fetchSellerProducts();
  }, [id]);

  const fetchSellerData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/sellers/${id}`);
      setSeller(response.data);
    } catch (error) {
      console.error('Error fetching seller data:', error);
    }
  };

  const fetchSellerProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/sellers/${id}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="seller-page">
      <Navbar />
      
      <div className="seller-container">
        <div className="seller-header">
          <div className="seller-info">
            <div className="seller-avatar">
              {seller?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="seller-details">
              <h2>{seller?.username}</h2>
              <p className="seller-rating">⭐ {seller?.rating || 0} Rating</p>
            </div>
          </div>
        </div>

        <div className="seller-tabs">
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button 
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        <div className="seller-content">
          {activeTab === 'products' && (
            <div className="products-section">
              <div className="add-product-btn">
                <button className="btn-add">+ Add New Product</button>
              </div>
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <p>No reviews yet</p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              <p>{seller?.bio || 'No information available'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerPage;
