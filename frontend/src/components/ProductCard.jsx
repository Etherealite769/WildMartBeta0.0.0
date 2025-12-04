import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/ProductCard.css';

const ProductCard = ({ product, onClick, showSeller = true, showEditButton = false }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle both field name formats from backend (old Product format and new ProductDTO format)
  const productName = product.productName || product.name || 'Untitled Product';
  const productPrice = product.price || 0;
  const productImage = product.imageUrl || '';
  const productCategory = product.categoryName || product.category?.categoryName || product.category || '';
  const sellerName = product.sellerName || product.seller?.firstName || 'Unknown Seller';
  const stockQuantity = product.quantityAvailable || product.stockQuantity || product.quantity || 0;
  const createdAt = product.createdAt ? new Date(product.createdAt) : null;
  
  // Check if product is new (less than 7 days old)
  const isNew = createdAt && (Date.now() - createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5;

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleEditProduct = (e) => {
    e.stopPropagation();
    navigate(`/edit-product/${product.productId || product.id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    // Get product ID (handle both field name formats)
    const productId = product.productId || product.id;
    
    if (!productId) {
      toast.error('Product ID not found');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to add items to cart');
        return;
      }
      
      // Add to cart API call
      await axios.post('http://localhost:8080/api/cart/add', 
        { productId: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  return (
    <div className="product-card" onClick={onClick}>
      {/* Badges */}
      <div className="product-badges">
        {isNew && <span className="badge badge-new">NEW</span>}
        {isLowStock && <span className="badge badge-low-stock">Only {stockQuantity} left</span>}
      </div>

      {/* Like Button */}
      <button 
        className={`like-btn-floating ${isLiked ? 'liked' : ''}`}
        onClick={handleLike}
        aria-label="Like product"
      >
        <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      {/* Product Image */}
      <div className="product-image">
        {!imageLoaded && !imageError && (
          <div className="image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        )}
        {imageError && (
          <div className="image-placeholder error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>No Image</span>
          </div>
        )}
        {productImage && !imageError && (
          <img 
            src={productImage} 
            alt={productName}
            className={imageLoaded ? 'loaded' : ''}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        )}
        {!productImage && (
          <div className="image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>No Image</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        {productCategory && (
          <span className="product-category">{productCategory}</span>
        )}
        <h3 className="product-name" title={productName}>{productName}</h3>
        {showSeller && (
          <p className="product-seller">by {sellerName}</p>
        )}
        
        <div className="product-footer">
          <div className="price-section">
            <span className="product-price">₱{productPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {showEditButton ? (
            <button 
              className="edit-product-btn"
              onClick={handleEditProduct}
              aria-label="Edit product"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          ) : (
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              aria-label="Add to cart"
              disabled={stockQuantity === 0}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;