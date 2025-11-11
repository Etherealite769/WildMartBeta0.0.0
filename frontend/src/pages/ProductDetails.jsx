import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await axios.post('http://localhost:8080/api/cart/add', 
        { productId: id, quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await axios.delete(`http://localhost:8080/api/user/likes/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`http://localhost:8080/api/user/likes/${id}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-details-page">
      <Navbar />
      
      <div className="product-details-container">
        <div className="product-images">
          <div className="main-image">
            <img src={product.imageUrl || '/placeholder.png'} alt={product.name} />
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <div className="product-rating">
            <span>⭐ {product.rating || 0}</span>
            <span>({product.reviewCount || 0} reviews)</span>
          </div>

          <div className="product-price">
            <h2>${product.price}</h2>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-quantity">
            <label>Quantity:</label>
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="product-actions">
            <button 
              className="btn-add-cart"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button 
              className={`btn-like ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="seller-info">
            <h3>Seller Information</h3>
            <div className="seller-card">
              <div className="seller-avatar">
                {product.seller?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="seller-details">
                <h4>{product.seller?.username}</h4>
                <p>⭐ {product.seller?.rating || 0}</p>
              </div>
              <button 
                className="btn-view-seller"
                onClick={() => navigate(`/seller/${product.seller?.id}`)}
              >
                View Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
