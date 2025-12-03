import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/ProductCard.css';
 
const ProductCard = ({ product, onClick }) => {
  const [isLiked, setIsLiked] = useState(product.isLiked || false); // Assume product has isLiked property
 
  // Handle both field name formats from backend (old Product format and new ProductDTO format)
  const productName = product.productName || product.name || 'Untitled Product';
  const productPrice = product.price || 0;
  const productImage = product.imageUrl || '/placeholder.png';
 
  useEffect(() => {
    setIsLiked(product.isLiked || false);
  }, [product.isLiked]);
 
  const handleLikeToggle = async (e) => {
    e.stopPropagation(); // Prevent card click from firing
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to like products.');
      return;
    }
 
    try {
      if (isLiked) {
        // Unlike product
        await axios.delete(`http://localhost:8080/api/likes/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Like product
        await axios.post(`http://localhost:8080/api/likes/${product.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsLiked(!isLiked); // Toggle local state
      // Optionally, you might want to trigger a refresh of the parent component's product list
      // if it depends on the like status, or if there's a global state management.
    } catch (error) {
      console.error('Error toggling like status:', error.response?.data || error.message);
      toast.error('Failed to update like status. Please try again.');
    }
  };
 
  return (
<div className="product-card" onClick={onClick}>
<div className="product-image">
<img 
          src={productImage} 
          alt={productName}
          onError={(e) => {
            e.target.src = '/placeholder.png';
          }}
        />
</div>
<div className="product-info">
<div className="product-header">
<h3 className="product-name">{productName}</h3>
<div className="product-actions">
<span 
              className={`like-icon ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeToggle}
>
              {isLiked ? '❤️' : '♡'}
</span>
<span className="options-icon">•••</span> {/* Placeholder for options icon */}
</div>
</div>
<span className="product-price">${productPrice}</span>
</div>
</div>
  );
};
 
export default ProductCard;